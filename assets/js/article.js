/**
 * WordPress REST API 客户端库
 * @version 3.0.0
 */

import axios from 'axios';
import { LRUCache } from 'lru-cache';
import { v4 as uuidv4 } from 'uuid';
import { RateLimiter } from 'limiter';
import { z } from 'zod';

// 常量定义
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_BASE_PATH = '/wp-json/wp/v2';
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Zod 验证模式
const WordPressPostSchema = z.object({
    id: z.number().optional(),
    date: z.string().optional(),
    date_gmt: z.string().optional(),
    guid: z.object({ rendered: z.string() }).optional(),
    modified: z.string().optional(),
    modified_gmt: z.string().optional(),
    slug: z.string().optional(),
    status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).optional(),
    type: z.string().optional(),
    link: z.string().url().optional(),
    title: z.object({ rendered: z.string() }),
    content: z.object({ rendered: z.string(), protected: z.boolean() }),
    excerpt: z.object({ rendered: z.string(), protected: z.boolean() }),
    author: z.number(),
    featured_media: z.number().optional(),
    comment_status: z.enum(['open', 'closed']).optional(),
    ping_status: z.enum(['open', 'closed']).optional(),
    sticky: z.boolean().optional(),
    template: z.string().optional(),
    format: z.enum(['standard', 'aside', 'chat', 'gallery', 'link', 'image', 'quote', 'status', 'video', 'audio']).optional(),
    meta: z.record(z.any()).optional(),
    categories: z.array(z.number()).optional(),
    tags: z.array(z.number()).optional(),
    _links: z.record(z.any()).optional()
});

const CreatePostSchema = WordPressPostSchema.omit({
    id: true,
    date: true,
    date_gmt: true,
    modified: true,
    modified_gmt: true,
    guid: true,
    _links: true
}).extend({
    title: z.string().min(1),
    content: z.string(),
    excerpt: z.string().optional(),
    status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).default('draft')
});

// 错误类型
class WordPressAPIError extends Error {
    constructor(message, status = null, code = 'UNKNOWN_ERROR', details = null, originalError = null, requestId = null) {
        super(message);
        this.name = 'WordPressAPIError';
        this.status = status;
        this.code = code;
        this.details = details;
        this.originalError = originalError;
        this.requestId = requestId || uuidv4();
        this.timestamp = new Date().toISOString();

        if (originalError && originalError.stack) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            code: this.code,
            details: this.details,
            requestId: this.requestId,
            timestamp: this.timestamp
        };
    }

    isNetworkError() {
        return this.code === 'NETWORK_ERROR';
    }

    isTimeoutError() {
        return this.code === 'TIMEOUT_ERROR';
    }

    isAuthError() {
        return this.status === 401 || this.status === 403;
    }

    isServerError() {
        return this.status >= 500;
    }

    isClientError() {
        return this.status >= 400 && this.status < 500;
    }

    isRetryable() {
        return this.isNetworkError() ||
            this.isTimeoutError() ||
            (this.status && RETRYABLE_STATUS_CODES.includes(this.status));
    }
}

// 错误代码映射
const ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    PARSE_ERROR: 'PARSE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    CONFIG_ERROR: 'CONFIG_ERROR',
    ABORT_ERROR: 'ABORT_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// 错误工厂
class ErrorFactory {
    static create(type, options = {}) {
        const {
            message = '',
            status = null,
            details = null,
            originalError = null,
            requestId = null
        } = options;

        const errorMessages = {
            [ERROR_CODES.NETWORK_ERROR]: message || '网络连接失败，请检查网络设置',
            [ERROR_CODES.TIMEOUT_ERROR]: message || '请求超时，请稍后重试',
            [ERROR_CODES.PARSE_ERROR]: message || '响应数据解析失败',
            [ERROR_CODES.VALIDATION_ERROR]: message || '请求参数验证失败',
            [ERROR_CODES.AUTH_ERROR]: message || '身份验证失败，请重新登录',
            [ERROR_CODES.RATE_LIMIT_ERROR]: message || '请求过于频繁，请稍后重试',
            [ERROR_CODES.CONFIG_ERROR]: message || '客户端配置错误',
            [ERROR_CODES.ABORT_ERROR]: message || '请求已被取消',
            [ERROR_CODES.UNKNOWN_ERROR]: message || '未知错误发生'
        };

        return new WordPressAPIError(
            errorMessages[type] || message,
            status,
            type,
            details,
            originalError,
            requestId
        );
    }
}

// 缓存管理器
class CacheManager {
    constructor(options = {}) {
        this.cache = new LRUCache({
            max: options.maxSize || 100,
            ttl: options.ttl || 300000, // 5分钟
            updateAgeOnGet: true,
            updateAgeOnHas: true,
        });
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, value, ttl) {
        this.cache.set(key, value, { ttl });
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        return this.cache.has(key);
    }
}

// 请求队列管理器
class RequestQueue {
    constructor(concurrency = 5) {
        this.concurrency = concurrency;
        this.queue = [];
        this.activeCount = 0;
    }

    async enqueue(requestFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ requestFn, resolve, reject });
            this._process();
        });
    }

    async _process() {
        if (this.activeCount >= this.concurrency || this.queue.length === 0) {
            return;
        }

        this.activeCount++;
        const { requestFn, resolve, reject } = this.queue.shift();

        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.activeCount--;
            this._process();
        }
    }

    clear() {
        this.queue = [];
    }
}

class WordPressAPI {
    constructor(baseURL, options = {}) {
        this._validateConfig(baseURL, options);

        this.baseURL = baseURL.replace(/\/$/, '');
        this.options = {
            timeout: DEFAULT_TIMEOUT,
            retryCount: 0,
            retryDelay: 1000,
            maxRetryDelay: 30000,
            backoffMultiplier: 2,
            enableCache: true,
            enableRateLimit: false,
            rateLimitRequests: 10,
            rateLimitInterval: 60000, // 1分钟
            requestConcurrency: 5,
            validateResponses: false,
            ...options
        };

        // 初始化 axios 实例
        this.axios = axios.create({
            baseURL: `${this.baseURL}${DEFAULT_BASE_PATH}`,
            timeout: this.options.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        // 初始化管理器
        this.cacheManager = new CacheManager(options.cache);
        this.requestQueue = new RequestQueue(this.options.requestConcurrency);

        // 初始化限流器
        if (this.options.enableRateLimit) {
            this.rateLimiter = new RateLimiter({
                tokensPerInterval: this.options.rateLimitRequests,
                interval: this.options.rateLimitInterval
            });
        }

        // 统计
        this.stats = {
            totalRequests: 0,
            failedRequests: 0,
            successfulRequests: 0,
            retryCount: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        // 设置拦截器
        this._setupInterceptors();
    }

    /**
     * 配置验证
     */
    _validateConfig(baseURL, options) {
        if (!baseURL) {
            throw ErrorFactory.create(ERROR_CODES.CONFIG_ERROR, {
                message: 'baseURL 是必需的参数'
            });
        }

        try {
            new URL(baseURL);
        } catch (error) {
            throw ErrorFactory.create(ERROR_CODES.CONFIG_ERROR, {
                message: 'baseURL 格式无效',
                originalError: error
            });
        }

        const ConfigSchema = z.object({
            timeout: z.number().positive().optional(),
            retryCount: z.number().int().nonnegative().optional(),
            retryDelay: z.number().positive().optional(),
            enableCache: z.boolean().optional(),
            requestConcurrency: z.number().int().positive().optional()
        });

        try {
            ConfigSchema.parse(options);
        } catch (error) {
            throw ErrorFactory.create(ERROR_CODES.VALIDATION_ERROR, {
                message: '配置参数验证失败',
                details: error.errors
            });
        }
    }

    /**
     * 设置拦截器
     */
    _setupInterceptors() {
        // 请求拦截器
        this.axios.interceptors.request.use(
            (config) => {
                const requestId = uuidv4();
                config.headers['X-Request-ID'] = requestId;
                config.metadata = { startTime: Date.now(), requestId };

                console.debug(`[WordPressAPI] 发送请求: ${config.method?.toUpperCase()} ${config.url}`, { requestId });

                return config;
            },
            (error) => {
                const requestId = error.config?.metadata?.requestId;
                throw ErrorFactory.create(ERROR_CODES.NETWORK_ERROR, {
                    message: '请求配置错误',
                    originalError: error,
                    requestId
                });
            }
        );

        // 响应拦截器
        this.axios.interceptors.response.use(
            (response) => {
                const { startTime, requestId } = response.config.metadata || {};
                const duration = startTime ? Date.now() - startTime : null;

                console.debug(`[WordPressAPI] 收到响应: ${response.status} ${response.statusText}`, {
                    requestId,
                    duration: `${duration}ms`
                });

                // 添加WordPress特定的头信息
                response.wpHeaders = this._parseWpHeaders(response.headers);

                return response;
            },
            (error) => {
                const requestId = error.config?.metadata?.requestId;

                if (axios.isAxiosError(error)) {
                    if (error.code === 'ECONNABORTED') {
                        throw ErrorFactory.create(ERROR_CODES.TIMEOUT_ERROR, {
                            message: `请求超时 (${error.config?.timeout}ms)`,
                            originalError: error,
                            requestId
                        });
                    }

                    if (error.response) {
                        const { status, data } = error.response;

                        if (status === 401 || status === 403) {
                            throw ErrorFactory.create(ERROR_CODES.AUTH_ERROR, {
                                status,
                                message: data?.message || '身份验证失败',
                                details: data,
                                requestId
                            });
                        }

                        if (status === 429) {
                            throw ErrorFactory.create(ERROR_CODES.RATE_LIMIT_ERROR, {
                                status: 429,
                                message: '请求频率超限',
                                details: data,
                                requestId
                            });
                        }

                        throw ErrorFactory.create(ERROR_CODES.UNKNOWN_ERROR, {
                            status,
                            message: data?.message || `HTTP ${status} 错误`,
                            details: data,
                            originalError: error,
                            requestId
                        });
                    }

                    if (error.request) {
                        throw ErrorFactory.create(ERROR_CODES.NETWORK_ERROR, {
                            message: '网络连接失败',
                            originalError: error,
                            requestId
                        });
                    }
                }

                throw ErrorFactory.create(ERROR_CODES.UNKNOWN_ERROR, {
                    message: `请求失败: ${error.message}`,
                    originalError: error,
                    requestId
                });
            }
        );
    }

    /**
     * 解析WordPress头信息
     */
    _parseWpHeaders(headers) {
        const result = {};
        const wpTotal = headers['x-wp-total'];
        const wpTotalPages = headers['x-wp-totalpages'];

        if (wpTotal) result.totalItems = parseInt(wpTotal);
        if (wpTotalPages) result.totalPages = parseInt(wpTotalPages);

        return result;
    }

    /**
     * 发送请求
     */
    async _request(config) {
        this.stats.totalRequests++;
        const requestId = uuidv4();

        try {
            // 速率限制检查
            if (this.rateLimiter) {
                await this.rateLimiter.removeTokens(1);
            }

            // 缓存检查
            if (config.method?.toLowerCase() === 'get' && this.options.enableCache) {
                const cacheKey = this._getCacheKey(config);
                const cached = this.cacheManager.get(cacheKey);

                if (cached) {
                    this.stats.cacheHits++;
                    console.debug(`[WordPressAPI] 缓存命中: ${cacheKey}`, { requestId });
                    return cached;
                }
                this.stats.cacheMisses++;
            }

            // 队列处理
            const executeRequest = async () => {
                const response = await this.axios.request(config);

                // 响应验证
                if (this.options.validateResponses && config.responseSchema) {
                    try {
                        response.data = config.responseSchema.parse(response.data);
                    } catch (validationError) {
                        throw ErrorFactory.create(ERROR_CODES.VALIDATION_ERROR, {
                            message: '响应数据验证失败',
                            details: validationError.errors,
                            requestId
                        });
                    }
                }

                // 构建结果
                const result = {
                    data: response.data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.wpHeaders,
                    requestId
                };

                // 缓存响应
                if (config.method?.toLowerCase() === 'get' && this.options.enableCache && config.cache !== false) {
                    const cacheKey = this._getCacheKey(config);
                    this.cacheManager.set(cacheKey, result, config.cacheTtl);
                }

                return result;
            };

            const result = await this.requestQueue.enqueue(executeRequest);
            this.stats.successfulRequests++;

            return result;

        } catch (error) {
            this.stats.failedRequests++;

            // 重试逻辑
            if (config.retryCount > 0 && error.isRetryable && error.isRetryable()) {
                return this._retryRequest(config, error, requestId);
            }

            throw error;
        }
    }

    /**
     * 重试请求
     */
    async _retryRequest(config, error, requestId, attempt = 0) {
        this.stats.retryCount++;
        const delay = this._calculateRetryDelay(attempt);

        console.warn(`[WordPressAPI] 请求失败，${delay}ms后重试 (${attempt + 1}/${config.retryCount})`, {
            requestId,
            error: error.message
        });

        await new Promise(resolve => setTimeout(resolve, delay));

        // 创建新的配置进行重试
        const retryConfig = {
            ...config,
            retryCount: config.retryCount - 1
        };

        return this._request(retryConfig);
    }

    /**
     * 计算重试延迟
     */
    _calculateRetryDelay(attempt) {
        const delay = this.options.retryDelay * Math.pow(this.options.backoffMultiplier, attempt);
        return Math.min(delay, this.options.maxRetryDelay);
    }

    /**
     * 生成缓存键
     */
    _getCacheKey(config) {
        const { url, method, params, data } = config;
        return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
    }

    /**
     * 基础HTTP方法
     */
    async get(endpoint, params = {}, options = {}) {
        return this._request({
            url: endpoint,
            method: 'GET',
            params,
            ...options
        });
    }

    async post(endpoint, data = {}, options = {}) {
        // 数据验证
        if (options.validate !== false && options.schema) {
            try {
                data = options.schema.parse(data);
            } catch (error) {
                throw ErrorFactory.create(ERROR_CODES.VALIDATION_ERROR, {
                    message: '请求数据验证失败',
                    details: error.errors
                });
            }
        }

        return this._request({
            url: endpoint,
            method: 'POST',
            data,
            ...options
        });
    }

    async put(endpoint, data = {}, options = {}) {
        return this._request({
            url: endpoint,
            method: 'PUT',
            data,
            ...options
        });
    }

    async delete(endpoint, options = {}) {
        return this._request({
            url: endpoint,
            method: 'DELETE',
            ...options
        });
    }

    /**
     * 便捷方法 - 文章操作
     */
    async createPost(data, options = {}) {
        return this.post('/posts', data, {
            schema: CreatePostSchema,
            ...options
        });
    }

    async getPosts(params = {}, options = {}) {
        return this.get('/posts', params, {
            responseSchema: z.array(WordPressPostSchema),
            ...options
        });
    }

    async getPost(id, params = {}, options = {}) {
        return this.get(`/posts/${id}`, params, {
            responseSchema: WordPressPostSchema,
            ...options
        });
    }

    /**
     * 批量操作
     */
    async batch(requests, options = {}) {
        const batchRequests = requests.map((request, index) => ({
            path: request.path,
            body: request.data,
            method: request.method || 'GET',
            headers: request.headers
        }));

        return this.post('/batch', { requests: batchRequests }, options);
    }

    /**
     * 清空缓存
     */
    clearCache() {
        this.cacheManager.clear();
        console.debug('[WordPressAPI] 缓存已清空');
    }

    /**
     * 设置认证token
     */
    setAuthToken(token) {
        if (!token) {
            throw ErrorFactory.create(ERROR_CODES.VALIDATION_ERROR, {
                message: 'token 不能为空'
            });
        }

        this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            ...this.stats,
            cacheHitRate: this.stats.totalRequests > 0 ?
                (this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100 : 0
        };
    }

    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            failedRequests: 0,
            successfulRequests: 0,
            retryCount: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
    }

    /**
     * 资源工厂方法
     */
    createResource(resource, schema = null) {
        return {
            list: (params = {}, options = {}) => this.get(`/${resource}`, params, {
                responseSchema: schema ? z.array(schema) : undefined,
                ...options
            }),
            get: (id, params = {}, options = {}) => this.get(`/${resource}/${id}`, params, {
                responseSchema: schema,
                ...options
            }),
            create: (data, options = {}) => this.post(`/${resource}`, data, {
                schema,
                ...options
            }),
            update: (id, data, options = {}) => this.put(`/${resource}/${id}`, data, {
                schema,
                ...options
            }),
            delete: (id, options = {}) => this.delete(`/${resource}/${id}`, options)
        };
    }

    // ===== 预定义资源 =====
    get posts() {
        return this.createResource('posts', WordPressPostSchema);
    }

    get pages() {
        return this.createResource('pages');
    }

    get categories() {
        return this.createResource('categories');
    }

    get tags() {
        return this.createResource('tags');
    }

    get media() {
        return this.createResource('media');
    }

    get users() {
        return this.createResource('users');
    }

    get comments() {
        return this.createResource('comments');
    }
}

// 创建默认实例的工厂函数
export function createWordPressAPI(baseURL, options = {}) {
    return new WordPressAPI(baseURL, options);
}

// 导出主要类和工具
export {
    WordPressAPI,
    WordPressAPIError,
    ERROR_CODES,
    ErrorFactory,
    WordPressPostSchema,
    CreatePostSchema
};

// CommonJS 支持
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WordPressAPI,
        WordPressAPIError,
        ERROR_CODES,
        ErrorFactory,
        WordPressPostSchema,
        CreatePostSchema,
        createWordPressAPI,
        default: WordPressAPI
    };
}