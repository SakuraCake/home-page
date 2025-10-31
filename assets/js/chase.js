/**
 * 获取Bangumi用户收藏数据
 * @param {Object} options - 请求参数
 * @param {string} options.username - 用户名
 * @param {number} [options.subject_type] - 条目类型 (1:书籍, 2:动画, 3:音乐, 4:游戏, 6:三次元)
 * @param {number} [options.type] - 收藏类型 (1:想看, 2:看过, 3:在看, 4:搁置, 5:抛弃)
 * @param {number} [options.limit=50] - 每页数量
 * @param {number} [options.offset=0] - 偏移量
 * @returns {Promise<Object>} 处理后的收藏数据
 */
async function getBangumiCollections(options) {
    const {
        username,
        subject_type,
        type,
        limit = 50,
        offset = 0
    } = options;

    if (!username) {
        throw new Error('用户名不能为空');
    }

    const params = new URLSearchParams();
    if (subject_type) params.append('subject_type', subject_type);
    if (type) params.append('type', type);
    params.append('limit', limit);
    params.append('offset', offset);

    try {
        const response = await fetch(`https://api.bgm.tv/v0/users/${username}/collections?${params}`);

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return parseCollectionData(data);
    } catch (error) {
        console.error('获取Bangumi收藏数据失败:', error);
        throw error;
    }
}

/**
 * 解析收藏数据
 * @param {Object} rawData - 原始API返回数据
 * @returns {Object} 解析后的数据
 */
function parseCollectionData(rawData) {
    if (!rawData.data || !Array.isArray(rawData.data)) {
        return {
            total: 0,
            collections: [],
            statistics: {}
        };
    }

    const collections = rawData.data.map(item => ({
        collectionInfo: {
            id: item.subject_id,
            type: getCollectionTypeText(item.type),
            status: getSubjectStatus(item.ep_status, item.vol_status),
            updatedAt: formatDate(item.updated_at),
            rate: item.rate,
            comment: item.comment,
            tags: item.tags,
            private: item.private
        },
        subject: {
            id: item.subject.id,
            name: item.subject.name_cn || item.subject.name,
            originalName: item.subject.name,
            date: item.subject.date,
            score: item.subject.score,
            type: getSubjectTypeText(item.subject.type),
            episodes: item.subject.eps,
            volumes: item.subject.volumes,
            rank: item.subject.rank,
            collectionTotal: item.subject.collection_total,
            summary: item.subject.short_summary,
            images: {
                small: item.subject.images.small,
                medium: item.subject.images.medium,
                large: item.subject.images.large,
                common: item.subject.images.common,
                grid: item.subject.images.grid
            },
            tags: item.subject.tags.map(tag => ({
                name: tag.name,
                count: tag.count
            }))
        }
    }));

    const statistics = calculateStatistics(collections);

    return {
        total: collections.length,
        collections,
        statistics
    };
}

/**
 * 获取收藏类型文本
 * @param {number} type - 收藏类型代码
 * @returns {string} 收藏类型文本
 */
function getCollectionTypeText(type) {
    const typeMap = {
        1: '想看',
        2: '看过',
        3: '在看',
        4: '搁置',
        5: '抛弃'
    };
    return typeMap[type] || '未知';
}

/**
 * 获取条目类型文本
 * @param {number} type - 条目类型代码
 * @returns {string} 条目类型文本
 */
function getSubjectTypeText(type) {
    const typeMap = {
        1: '书籍',
        2: '动画',
        3: '音乐',
        4: '游戏',
        6: '三次元'
    };
    return typeMap[type] || '未知';
}

/**
 * 获取条目状态
 * @param {number} epStatus - 章节状态
 * @param {number} volStatus - 卷状态
 * @returns {string} 状态文本
 */
function getSubjectStatus(epStatus, volStatus) {
    if (epStatus > 0) return `看到第${epStatus}集`;
    if (volStatus > 0) return `读到第${volStatus}卷`;
    return '未开始';
}

/**
 * 格式化日期
 * @param {string} dateString - ISO日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

/**
 * 计算统计信息
 * @param {Array} collections - 收藏列表
 * @returns {Object} 统计信息
 */
function calculateStatistics(collections) {
    const typeCount = {};
    const collectionTypeCount = {};
    let totalScore = 0;
    let ratedCount = 0;

    collections.forEach(item => {
        const subjectType = item.subject.type;
        typeCount[subjectType] = (typeCount[subjectType] || 0) + 1;

        const collectionType = item.collectionInfo.type;
        collectionTypeCount[collectionType] = (collectionTypeCount[collectionType] || 0) + 1;

        if (item.collectionInfo.rate > 0) {
            totalScore += item.collectionInfo.rate;
            ratedCount++;
        }
    });

    return {
        typeCount,
        collectionTypeCount,
        averageScore: ratedCount > 0 ? (totalScore / ratedCount).toFixed(1) : 0,
        ratedCount,
        totalCount: collections.length
    };
}

// 全局变量
let animeData = [];
let filteredAnimeData = [];
let currentPageNum = 0;
let pageSize = 20;
let hasMoreData = true;
let currentFilterStatus = 'all'; // 当前筛选状态
let currentSearchTerm = ''; // 当前搜索关键词

function initChasePageOnLoad() {
    if (window.location.pathname.includes('chase') || currentPage === 'chase') {
        initChasePage();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initChasePageOnLoad();
    }, 100);
});

/**
 * 初始化追番页面
 */
function initChasePage() {
    loadBangumiData(true);
    initSearchAndFilter();
    initLoadMoreButton();
    initDetailDialog();
}

/**
 * 初始化加载更多按钮
 */
function initLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadBangumiData(false);
        });
    }
}

/**
 * 加载真实Bangumi API数据
 */
async function loadBangumiData(reset = false) {
    const animeList = document.getElementById('anime-list');

    // 检查元素是否存在
    if (!animeList) {
        console.error('anime-list元素未找到，页面可能未正确加载');
        return;
    }

    try {
        if (reset) {
            currentPageNum = 0;
            animeData = [];
            filteredAnimeData = [];
            hasMoreData = true;

            animeList.innerHTML = `
                <div class="loading-state">
                    <mdui-circular-progress></mdui-circular-progress>
                    <p>正在从Bangumi加载追番数据...</p>
                </div>
            `;
        }

        // 构建API请求参数
        const apiOptions = {
            username: 'sakuracake',
            subject_type: 2,
            limit: 50,
            offset: currentPageNum * 50
        };

        // 根据当前筛选状态添加type参数
        if (currentFilterStatus !== 'all') {
            const statusMap = {
                'watching': 3,    // 在看
                'completed': 2,   // 看过
                'planned': 1,     // 想看
                'on_hold': 4,    // 搁置
                'dropped': 5      // 抛弃
            };
            apiOptions.type = statusMap[currentFilterStatus];
        }

        const result = await getBangumiCollections(apiOptions);

        const newAnimeData = result.collections.map(collection => {
            const subject = collection.subject;
            const collectionInfo = collection.collectionInfo;

            return {
                id: subject.id,
                title: subject.name,
                originalTitle: subject.originalName,
                status: mapBangumiStatus(collectionInfo.type),
                progress: getProgressFromStatus(collectionInfo.status),
                totalEpisodes: subject.episodes || 0,
                score: subject.score || 0,
                cover: subject.images?.medium || subject.images?.small || 'https://via.placeholder.com/60x80?text=封面',
                description: subject.summary || '暂无简介',
                bangumiUrl: `https://bgm.tv/subject/${subject.id}`
            };
        });

        animeData = [...animeData, ...newAnimeData];

        hasMoreData = newAnimeData.length >= 50;

        filteredAnimeData = [...animeData];
        renderAnimeList();
        updateStatistics();
        showLoadMoreButton();

        currentPageNum++;

    } catch (error) {
        console.error('加载Bangumi数据失败:', error);

        // 如果API调用失败，显示错误信息并提供重试选项
        if (animeList) {
            animeList.innerHTML = `
                <div class="empty-state">
                    <mdui-icon name="error_outline"></mdui-icon>
                    <p>加载Bangumi数据失败</p>
                    <p style="font-size: 12px; margin-top: 10px;">${error.message}</p>
                    <mdui-button icon="refresh" onclick="loadBangumiData(true)" style="margin-top: 15px;">
                        重试
                    </mdui-button>
                </div>
            `;
        }
    }
}

/**
 * 映射Bangumi状态到前端状态
 */
function mapBangumiStatus(bangumiStatus) {
    const statusMap = {
        '想看': 'planned',
        '看过': 'completed',
        '在看': 'watching',
        '搁置': 'on_hold',
        '抛弃': 'dropped'
    };
    return statusMap[bangumiStatus] || 'planned';
}

/**
 * 从状态文本中提取进度
 */
function getProgressFromStatus(statusText) {
    if (!statusText) return 0;

    // 匹配"看到第X集"或"读到第X卷"
    const match = statusText.match(/第(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

function initSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const searchTerm = e.target.value.trim().toLowerCase();
            filterAnimeList(searchTerm);
        }, 300));
    }

    const statusSelect = document.getElementById('status-select');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            filterByStatus(e.target.value);
        });
    }
}

function filterByStatus(statusValue) {
    // 更新当前筛选状态
    currentFilterStatus = statusValue;

    // 重置数据并重新加载（根据筛选条件）
    currentPageNum = 0;
    animeData = [];
    filteredAnimeData = [];
    hasMoreData = true;

    // 重新加载数据，应用筛选条件
    loadBangumiData(true);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function filterAnimeList(searchTerm) {
    // 更新当前搜索关键词
    currentSearchTerm = searchTerm;

    // 如果搜索关键词为空，且当前没有筛选状态，则显示所有数据
    if (!searchTerm && currentFilterStatus === 'all') {
        filteredAnimeData = [...animeData];
        renderAnimeList();
        updateStatistics();
        return;
    }

    // 如果有搜索关键词或筛选状态，重置数据并重新加载
    currentPageNum = 0;
    animeData = [];
    filteredAnimeData = [];
    hasMoreData = true;

    // 重新加载数据，应用搜索和筛选条件
    loadBangumiData(true);
}

function renderAnimeList() {
    const animeList = document.getElementById('anime-list');

    if (!animeList) return;

    if (filteredAnimeData.length === 0) {
        animeList.innerHTML = `
            <div class="empty-state">
                <mdui-icon name="search_off"></mdui-icon>
                <p>没有找到匹配的动画</p>
            </div>
        `;
        return;
    }

    animeList.innerHTML = filteredAnimeData.map(anime => `
        <mdui-card clickable class="anime-card" data-id="${anime.id}">
            <div class="anime-card-content">
                <div class="anime-card-header">
                    <img src="${anime.cover}" alt="${anime.title}" class="anime-cover" onerror="this.src='https://via.placeholder.com/60x80?text=封面'">
                    <div class="anime-card-info">
                        <div class="anime-card-title">${anime.title}</div>
                        <div class="anime-card-original">${anime.originalTitle}</div>
                        <mdui-chip class="status-${anime.status}">${getStatusText(anime.status)}</mdui-chip>
                    </div>
                </div>
                <div class="anime-card-progress">
                    <div class="progress-info">
                        <span>进度: ${anime.progress}/${anime.totalEpisodes} 集</span>
                        ${anime.score ? `<span class="anime-score">评分: ${anime.score}</span>` : ''}
                    </div>
                    <mdui-linear-progress 
                        value="${anime.progress}" 
                        max="${anime.totalEpisodes}"
                        class="anime-progress-bar">
                    </mdui-linear-progress>
                </div>
            </div>
            <div slot="action">
                <mdui-button onclick="showAnimeDetail('${anime.id}')" variant="text">
                    <mdui-icon slot="icon" name="info"></mdui-icon>
                    查看详情
                </mdui-button>
                <mdui-button href="${anime.bangumiUrl}" target="_blank" variant="text">
                    <mdui-icon slot="icon" name="open_in_new"></mdui-icon>
                    Bangumi
                </mdui-button>
            </div>
        </mdui-card>
    `).join('');

    addCardClickEvents();
}

function getStatusText(status) {
    const statusMap = {
        'watching': '在看',
        'completed': '已看完',
        'planned': '想看',
        'on_hold': '搁置',
        'dropped': '抛弃'
    };
    return statusMap[status] || '未知';
}

function updateStatistics() {
    const statisticsSection = document.getElementById('statistics-section');
    const totalCount = document.getElementById('total-count');
    const watchingCount = document.getElementById('watching-count');
    const completedCount = document.getElementById('completed-count');
    const averageScore = document.getElementById('average-score');

    if (!statisticsSection || !totalCount) return;

    const stats = {
        total: filteredAnimeData.length,
        watching: filteredAnimeData.filter(a => a.status === 'watching').length,
        completed: filteredAnimeData.filter(a => a.status === 'completed').length,
        average: 0
    };

    const scoredAnime = filteredAnimeData.filter(a => a.score > 0);
    if (scoredAnime.length > 0) {
        stats.average = (scoredAnime.reduce((sum, a) => sum + a.score, 0) / scoredAnime.length).toFixed(1);
    }

    totalCount.textContent = stats.total;
    watchingCount.textContent = stats.watching;
    completedCount.textContent = stats.completed;
    averageScore.textContent = stats.average;

    statisticsSection.style.display = 'block';
}

function showLoadMoreButton() {
    const loadMoreSection = document.getElementById('load-more-section');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadingMore = document.getElementById('loading-more');

    if (loadMoreSection && loadMoreBtn && loadingMore) {
        if (hasMoreData && filteredAnimeData.length > 0) {
            loadMoreSection.style.display = 'block';
            loadMoreBtn.style.display = 'block';
            loadingMore.style.display = 'none';
        } else {
            loadMoreSection.style.display = 'none';
        }
    }
}

async function loadMoreData() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadingMore = document.getElementById('loading-more');

    if (loadMoreBtn && loadingMore) {
        loadMoreBtn.style.display = 'none';
        loadingMore.style.display = 'block';
    }

    try {
        // 直接调用loadBangumiData(false)会基于当前筛选条件加载更多数据
        await loadBangumiData(false);
    } catch (error) {
        console.error('加载更多数据失败:', error);
        showLoadMoreButton();
    }
}

function getCurrentFilterStatus() {
    const statusSelect = document.getElementById('status-select');
    if (statusSelect) {
        return statusSelect.value;
    }
    return 'all';
}

function addCardClickEvents() {
    const cards = document.querySelectorAll('.anime-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // 阻止按钮点击事件冒泡
            if (e.target.closest('mdui-button')) {
                return;
            }
            const animeId = card.getAttribute('data-id');
            if (animeId) {
                showAnimeDetail(animeId);
            }
        });
    });
}

function showAnimeDetail(animeId) {
    const anime = animeData.find(a => a.id === animeId);
    if (!anime) return;

    const dialog = document.getElementById('anime-detail-dialog');
    const content = document.getElementById('anime-detail-content');
    const viewBangumiBtn = document.getElementById('view-bangumi-btn');

    if (!dialog || !content || !viewBangumiBtn) return;

    content.innerHTML = `
        <div class="anime-detail-header">
            <img src="${anime.cover}" alt="${anime.title}" class="anime-detail-cover" onerror="this.src='https://via.placeholder.com/120x160?text=封面'">
            <div class="anime-detail-info">
                <div class="anime-detail-title">${anime.title}</div>
                <div class="anime-detail-original">${anime.originalTitle}</div>
                <div class="anime-detail-meta">
                    <div class="anime-detail-meta-item">
                        <span class="anime-detail-meta-label">状态</span>
                        <span class="anime-detail-meta-value">${getStatusText(anime.status)}</span>
                    </div>
                    <div class="anime-detail-meta-item">
                        <span class="anime-detail-meta-label">类型</span>
                        <span class="anime-detail-meta-value">${anime.type}</span>
                    </div>
                    ${anime.score ? `
                    <div class="anime-detail-meta-item">
                        <span class="anime-detail-meta-label">评分</span>
                        <span class="anime-detail-meta-value">${anime.score}</span>
                    </div>
                    ` : ''}
                    <div class="anime-detail-meta-item">
                        <span class="anime-detail-meta-label">排名</span>
                        <span class="anime-detail-meta-value">${anime.rank || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="anime-detail-description">
            ${anime.description}
        </div>
        <div class="anime-detail-progress">
            <div class="progress-info">
                <span>观看进度: ${anime.progress}/${anime.totalEpisodes} 集</span>
            </div>
            <mdui-linear-progress 
                value="${anime.progress}" 
                max="${anime.totalEpisodes}"
                class="anime-progress-bar">
            </mdui-linear-progress>
        </div>
    `;

    viewBangumiBtn.onclick = () => {
        window.open(anime.bangumiUrl, '_blank');
    };

    dialog.open = true;
}

function initDetailDialog() {
    const dialog = document.getElementById('anime-detail-dialog');
    const closeBtn = document.getElementById('close-detail-btn');

    if (dialog && closeBtn) {
        closeBtn.addEventListener('click', () => {
            dialog.open = false;
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getBangumiCollections,
        parseCollectionData,
        getCollectionTypeText,
        getSubjectTypeText
    };
}