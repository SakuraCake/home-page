/**
 * SakuraCake 个人主页 - 主脚本文件
 * 初始化页面交互功能
 */

// ==================== 常量配置 ====================

// 应用常量
const APP_CONFIG = {
    NAME: 'SakuraCake',
    VERSION: '0.1.0',
    DOMAIN: 'sorange.top'
};

// 响应式断点
const BREAKPOINTS = {
    DESKTOP: 768,
    TABLET: 750
};

// 页面配置
const PAGE_CONFIG = {
    index: {
        title: '首页',
        path: './page/index.html',
        navIndex: 0,
        initFunction: null
    },
    chase: {
        title: '追番',
        path: './page/chase.html',
        navIndex: 1,
        initFunction: 'initChasePage'
    }
};

// 导航菜单配置
const NAV_CONFIG = [
    { icon: 'home', headline: '首页', page: 'index' },
    { icon: 'video_library', headline: '追番', page: 'chase' },
    { icon: 'cloud', headline: '个人网盘', href: 'https://pan.sorange.top/', target: '_blank' }
];

// 页面脚本配置
const SCRIPT_CONFIG = {
    chase: './assets/js/chase.js',
    article: './assets/js/article.js'
};

// 错误消息常量
const ERROR_MESSAGES = {
    NAVIGATION_NOT_FOUND: '导航列表未找到',
    CONTAINER_NOT_FOUND: '内容容器未找到，页面结构可能有问题',
    PAGE_CONFIG_NOT_FOUND: (pageName) => `页面配置未找到: ${pageName}`,
    PAGE_LOAD_FAILED: (status) => `页面加载失败: ${status}`,
    SCRIPT_LOAD_FAILED: (scriptName) => `脚本加载失败: ${scriptName}`
};

// ==================== 全局变量 ====================

let currentPage;
let loadedScripts = new Set(); // 跟踪已加载的脚本

document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面
    initializeApplication();
});

/**
 * 初始化应用程序
 */
function initializeApplication() {
    try {
        // 初始化导航菜单
        initializeNavigation();
        
        // 初始化功能按钮
        initActionButtons();
        
        // 显示欢迎日志
        showWelcomeLog();
        
        // 加载首页
        loadPage('index');
        
        console.log(`${APP_CONFIG.NAME} v${APP_CONFIG.VERSION} 初始化完成`);
    } catch (error) {
        console.error('应用程序初始化失败:', error);
    }
}

/**
 * 初始化导航菜单
 */
function initializeNavigation() {
    const navigationDrawer = document.getElementById('navigation-drawer');
    const menuButton = document.getElementById('menu-button');
    const navList = document.querySelector('#navigation-drawer mdui-list');

    if (!navList) {
        console.error(ERROR_MESSAGES.NAVIGATION_NOT_FOUND);
        return;
    }

    // 动态生成导航菜单
    navList.innerHTML = NAV_CONFIG.map(item => {
        if (item.href) {
            // 外部链接
            return `<mdui-list-item rounded icon="${item.icon}" headline="${item.headline}" href="${item.href}" target="${item.target || '_self'}"></mdui-list-item>`;
        } else {
            // 内部页面
            return `<mdui-list-item rounded icon="${item.icon}" headline="${item.headline}"></mdui-list-item>`;
        }
    }).join('');

    const isDesktop = window.innerWidth >= 750;
    navigationDrawer.open = false;

    let userManuallyOpened = false;

    const toggleDrawer = () => {
        navigationDrawer.open = !navigationDrawer.open;
        if (navigationDrawer.open) {
            userManuallyOpened = true;
        }

        // 记录菜单栏展开状态到localStorage
        localStorage.setItem('navigationDrawerOpen', navigationDrawer.open.toString());
    };

    menuButton.addEventListener('click', toggleDrawer);

    // 为内部页面添加点击事件
    const navItems = document.querySelectorAll('#navigation-drawer mdui-list-item');
    navItems.forEach((item, index) => {
        const navItem = NAV_CONFIG[index];
        if (navItem.page) {
            item.addEventListener('click', () => {
                handleNavigationClick(navItem, isDesktop, userManuallyOpened, navigationDrawer);
            });
        }
    });

    window.addEventListener('resize', () => {
        if (!userManuallyOpened) {
            const currentIsDesktop = window.innerWidth >= 768;
            navigationDrawer.open = currentIsDesktop;
        }
    });
}

/**
 * 处理导航点击事件
 */
function handleNavigationClick(navItem, isDesktop, userManuallyOpened, navigationDrawer) {
    loadPage(navItem.page).then(() => {
        if (!isDesktop || !userManuallyOpened) {
            navigationDrawer.open = false;
        }
    }).catch(error => {
        console.error('页面切换失败:', error);
    });
}

/**
 * 初始化功能按钮
 */
function initActionButtons() {
    initializeNightModeToggle();
    initializeBackToTopButton();
    initializeSocialButtons();
}

/**
 * 初始化社交按钮
 */
function initializeSocialButtons() {
    const bilibiliButton = document.getElementById('bilibili-button');
    const steamButton = document.getElementById('steam-button');
    
    if (bilibiliButton) {
        bilibiliButton.addEventListener('click', () => {
            window.open('https://space.bilibili.com/123456', '_blank');
        });
    }
    
    if (steamButton) {
        steamButton.addEventListener('click', () => {
            window.open('https://steamcommunity.com/id/123456', '_blank');
        });
    }
}

/**
 * 初始化夜间模式切换
 */
function initializeNightModeToggle() {
    const nightModeToggle = document.getElementById('night-mode-toggle');
    if (!nightModeToggle) return;
    
    nightModeToggle.addEventListener('click', toggleNightMode);
}

/**
 * 切换夜间模式
 */
function toggleNightMode() {
    const body = document.body;
    const isNightMode = body.classList.contains('mdui-theme-layout-dark');
    
    if (isNightMode) {
        body.classList.remove('mdui-theme-layout-dark');
        localStorage.setItem('nightMode', 'false');
    } else {
        body.classList.add('mdui-theme-layout-dark');
        localStorage.setItem('nightMode', 'true');
    }
}

/**
 * 初始化返回顶部按钮
 */
function initializeBackToTopButton() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    
    backToTop.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', () => toggleBackToTopButton(backToTop));
}

/**
 * 滚动到顶部
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 切换返回顶部按钮显示状态
 */
function toggleBackToTopButton(button) {
    if (window.scrollY > 300) {
        button.style.display = 'block';
    } else {
        button.style.display = 'none';
    }
}

/**
 * 动态加载页面脚本
 * @param {string} pageName - 页面名称
 * @returns {Promise} - 脚本加载完成的Promise
 */
function loadPageScript(pageName) {
    return new Promise((resolve, reject) => {
        // 检查是否已加载
        if (loadedScripts.has(pageName)) {
            resolve();
            return;
        }

        // 检查是否有对应的脚本配置
        const scriptPath = SCRIPT_CONFIG[pageName];
        if (!scriptPath) {
            resolve(); // 没有脚本配置，直接返回成功
            return;
        }

        // 创建并加载脚本
        const script = createScriptElement(scriptPath, pageName, resolve, reject);
        document.head.appendChild(script);
    });
}

/**
 * 创建脚本元素
 */
function createScriptElement(scriptPath, pageName, resolve, reject) {
    const script = document.createElement('script');
    script.src = scriptPath;
    script.onload = () => handleScriptLoadSuccess(pageName, resolve);
    script.onerror = () => handleScriptLoadError(pageName, reject);
    return script;
}

/**
 * 处理脚本加载成功
 */
function handleScriptLoadSuccess(pageName, resolve) {
    loadedScripts.add(pageName);
    console.log(`脚本 ${pageName} 加载完成`);
    resolve();
}

/**
 * 处理脚本加载失败
 */
function handleScriptLoadError(pageName, reject) {
    console.error(`脚本 ${pageName} 加载失败`);
    reject(new Error(ERROR_MESSAGES.SCRIPT_LOAD_FAILED(pageName)));
}

/**
 * 加载页面内容
 * @param {string} pageName - 页面名称
 * @returns {Promise} - 页面加载完成的Promise
 */
function loadPage(pageName) {
    return new Promise((resolve, reject) => {
        try {
            if (currentPage === pageName) {
                resolve();
                return;
            }

            const pageConfig = validatePageConfig(pageName);
            const contentContainer = getContentContainer();
            
            showLoadingState(contentContainer);
            
            loadPageContent(pageConfig, pageName)
                .then(() => resolve())
                .catch(error => reject(error));
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 验证页面配置
 */
function validatePageConfig(pageName) {
    const pageConfig = PAGE_CONFIG[pageName];
    if (!pageConfig) {
        throw new Error(ERROR_MESSAGES.PAGE_CONFIG_NOT_FOUND(pageName));
    }
    return pageConfig;
}

/**
 * 获取内容容器
 */
function getContentContainer() {
    const contentContainer = document.querySelector('.centered-content');
    if (!contentContainer) {
        throw new Error(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
    }
    return contentContainer;
}

/**
 * 显示加载状态
 */
function showLoadingState(container) {
    container.innerHTML = '<mdui-circular-progress></mdui-circular-progress><p>加载中...</p>';
}

/**
 * 加载页面内容
 */
function loadPageContent(pageConfig, pageName) {
    return Promise.all([
        fetchPageHtml(pageConfig.path),
        loadPageScript(pageName)
    ])
    .then(([html]) => {
        updatePageContent(html, pageConfig, pageName);
    });
}

/**
 * 获取页面HTML内容
 */
function fetchPageHtml(path) {
    return fetch(path).then(response => {
        if (!response.ok) {
            throw new Error(ERROR_MESSAGES.PAGE_LOAD_FAILED(response.status));
        }
        return response.text();
    });
}

/**
 * 更新页面内容
 */
function updatePageContent(htmlContent, pageConfig, pageName) {
    const contentContainer = getContentContainer();
    contentContainer.innerHTML = htmlContent;
    currentPage = pageName;

    initActionButtons();

    // 调用页面特定的初始化函数
    if (pageConfig.initFunction) {
        setTimeout(() => {
            if (typeof window[pageConfig.initFunction] === 'function') {
                window[pageConfig.initFunction]();
            }
        }, 50);
    }

    updatePageTitle(pageName);
    updateActiveNavigationItem(pageName);
    
    console.log(`页面${pageName}加载完成`);
}

/**
 * 更新页面标题
 * @param {string} pageName - 页面名称
 */
function updatePageTitle(pageName) {
    const pageConfig = PAGE_CONFIG[pageName];
    const pageTitle = pageConfig ? pageConfig.title : APP_CONFIG.NAME;
    document.title = `${pageTitle} - ${APP_CONFIG.NAME}`;
}

/**
 * 更新导航菜单激活状态
 * @param {string} pageName - 当前页面名称
 */
function updateActiveNavigationItem(pageName) {
    const navItems = document.querySelectorAll('#navigation-drawer mdui-list-item');
    
    navItems.forEach((item, index) => {
        // 移除所有列表项的active属性
        item.removeAttribute('active');
        
        // 根据页面配置设置对应的列表项为激活状态
        const navItem = NAV_CONFIG[index];
        if (navItem && navItem.page === pageName) {
            item.setAttribute('active', '');
        }
    });
}

/**
 * 处理测试按钮点击事件
 * @param {string} buttonName - 按钮名称
 */
function handleButtonClick(buttonName) {
    console.log(`${buttonName}被点击`);

    //显示用户反馈
    // mdui.snackbar({
    //    message: `${buttonName}被点击`,
    //    position: 'top',
    //    timeout: 2000
    // });
}

/**
 * 显示欢迎日志
 */
function showWelcomeLog() {
    console.log(`===============================================
  ____            _                          
 / ___|    __ _  | | __  _   _   _ __    __ _ 
 \\___ \\   / _\` | | |/ / | | | | | '__|  / _\` |
  ___) | | (_| | |   <  | |_| | | |    | (_| |
 |____/   \\__,_| |_|\\_\\  \\__,_| |_|     \\__,_|
                                              
   ____           _                          
  / ___|   __ _  | | __   ___                
 | |      / _\` | | |/ /  / _ \\               
 | |___  | (_| | |   <  |  __/               
  \\____|  \\__,_| |_|\\_\\  \\___|               
===============================================
v${APP_CONFIG.VERSION} ${APP_CONFIG.DOMAIN}
`);
}