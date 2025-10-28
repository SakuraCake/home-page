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

  // 构建查询参数
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
    
    // 解析和处理数据
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
    // 收藏信息
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
    // 条目信息
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

  // 统计信息
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
    // 按条目类型统计
    const subjectType = item.subject.type;
    typeCount[subjectType] = (typeCount[subjectType] || 0) + 1;

    // 按收藏类型统计
    const collectionType = item.collectionInfo.type;
    collectionTypeCount[collectionType] = (collectionTypeCount[collectionType] || 0) + 1;

    // 评分统计
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

// 追番页面功能
let animeData = [];
let filteredAnimeData = [];

// 页面加载完成后初始化
function initChasePageOnLoad() {
    // 检查是否在追番页面
    if (window.location.pathname.includes('chase') || currentPage === 'chase') {
        initChasePage();
    }
}

// 监听页面切换事件
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保页面内容已加载
    setTimeout(() => {
        initChasePageOnLoad();
    }, 100);
});

/**
 * 初始化追番页面
 */
function initChasePage() {
    // 加载真实的Bangumi API数据
    loadBangumiData();
    
    // 初始化搜索和筛选功能
    initSearchAndFilter();
}

/**
 * 加载真实Bangumi API数据
 */
async function loadBangumiData() {
    const animeList = document.getElementById('anime-list');
    
    // 检查元素是否存在
    if (!animeList) {
        console.error('anime-list元素未找到，页面可能未正确加载');
        return;
    }
    
    try {
        // 显示加载状态
        animeList.innerHTML = `
            <div class="loading-state">
                <mdui-circular-progress></mdui-circular-progress>
                <p>正在从Bangumi加载追番数据...</p>
            </div>
        `;
        
        // 调用真实的Bangumi API
        const result = await getBangumiCollections({
            username: 'sakuracake', // 可以修改为实际的用户名
            subject_type: 2, // 动画类型
            limit: 50, // 加载更多数据
            offset: 0
        });
        
        // 转换API数据为前端格式
        animeData = result.collections.map(collection => {
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
        
        filteredAnimeData = [...animeData];
        renderAnimeList();
        updateStatistics();
        
    } catch (error) {
        console.error('加载Bangumi数据失败:', error);
        
        // 如果API调用失败，显示错误信息并提供重试选项
        if (animeList) {
            animeList.innerHTML = `
                <div class="empty-state">
                    <mdui-icon name="error_outline"></mdui-icon>
                    <p>加载Bangumi数据失败</p>
                    <p style="font-size: 12px; margin-top: 10px;">${error.message}</p>
                    <mdui-button onclick="loadBangumiData()" style="margin-top: 15px;">
                        <mdui-icon slot="icon" name="refresh"></mdui-icon>
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
        '搁置': 'planned',
        '抛弃': 'planned'
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

/**
 * 初始化搜索和筛选功能
 */
function initSearchAndFilter() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterAnimeList, 300));
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAnimeList);
    }
}

/**
 * 防抖函数
 */
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

/**
 * 筛选动画列表
 */
function filterAnimeList() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value : 'all';
    
    filteredAnimeData = animeData.filter(anime => {
        const matchesSearch = anime.title.toLowerCase().includes(searchTerm) || 
                            anime.originalTitle.toLowerCase().includes(searchTerm);
        const matchesStatus = statusValue === 'all' || anime.status === statusValue;
        
        return matchesSearch && matchesStatus;
    });
    
    renderAnimeList();
    updateStatistics();
}

/**
 * 渲染动画列表
 */
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
        <div class="anime-item" data-id="${anime.id}">
            <div class="anime-header">
                <img src="${anime.cover}" alt="${anime.title}" class="anime-cover" onerror="this.src='https://via.placeholder.com/60x80?text=封面'">
                <div class="anime-info">
                    <div class="anime-title">${anime.title}</div>
                    <div class="anime-meta">${anime.originalTitle}</div>
                    <span class="anime-status status-${anime.status}">${getStatusText(anime.status)}</span>
                </div>
            </div>
            <div class="anime-description">${anime.description}</div>
            <div class="anime-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(anime.progress / anime.totalEpisodes) * 100}%"></div>
                </div>
                <div class="progress-text">
                    进度: ${anime.progress}/${anime.totalEpisodes} 集
                    ${anime.score ? `| 评分: ${anime.score}` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * 获取状态文本
 */
function getStatusText(status) {
    const statusMap = {
        'watching': '在看',
        'completed': '已看完',
        'planned': '计划看'
    };
    return statusMap[status] || '未知';
}

/**
 * 更新统计信息
 */
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
    
    // 显示统计信息
    statisticsSection.style.display = 'block';
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getBangumiCollections,
        parseCollectionData,
        getCollectionTypeText,
        getSubjectTypeText
    };
}