/**
 * SakuraCake 个人主页 - 主脚本文件
 * 初始化页面交互功能
 */

// 页面状态管理
let currentPage = 'index';

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initActionButtons();
    
    // 确保DOM完全加载后再加载首页内容
    setTimeout(() => {
        loadPage('index'); // 默认加载首页
    }, 100);
    
    showWelcomeLog();
});

/**
 * 初始化导航功能
 */
function initNavigation() {
    const navigationDrawer = document.getElementById('navigation-drawer');
    const menuButton = document.getElementById('menu-button');
    const navItems = document.querySelectorAll('#navigation-drawer mdui-list-item');

    // 检测是否为PC端，如果是则默认展开侧边栏
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
        navigationDrawer.open = true;
    }

    // 抽屉栏控制函数
    const toggleDrawer = () => {
        navigationDrawer.open = !navigationDrawer.open;
    };

    // 菜单按钮事件 - 控制抽屉栏开关
    menuButton.addEventListener('click', toggleDrawer);

    // 导航项点击事件
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            switch(index) {
                case 0: // 首页
                    loadPage('index');
                    break;
                case 1: // 追番
                    loadPage('chase');
                    break;
                case 2: // 个人网盘（外部链接，不处理）
                    break;
            }
            // 在移动端点击后关闭抽屉栏，PC端保持展开
            if (!isDesktop) {
                navigationDrawer.open = false;
            }
        });
    });

    // 监听窗口大小变化，自适应侧边栏状态
    window.addEventListener('resize', () => {
        const currentIsDesktop = window.innerWidth >= 768;
        if (currentIsDesktop !== isDesktop) {
            navigationDrawer.open = currentIsDesktop;
        }
    });
}

/**
 * 初始化功能按钮
 */
function initActionButtons() {
    const bilibili_button = document.getElementById('bilibili-button');
    const steam_button = document.getElementById('steam-button');

    // Bilibili按钮
    if (bilibili_button) {
        bilibili_button.addEventListener('click', () => {
            handleButtonClick('Bilibili按钮被点击');
        });
    }

    // Steam按钮
    if (steam_button) {
        steam_button.addEventListener('click', () => {
            handleButtonClick('Steam按钮被点击');
        });
    }
}

/**
 * 加载页面内容
 * @param {string} pageName - 页面名称
 */
function loadPage(pageName) {
    if (currentPage === pageName) return; // 避免重复加载
    
    const contentContainer = document.querySelector('.centered-content');
    
    // 检查内容容器是否存在
    if (!contentContainer) {
        console.error('内容容器未找到，页面结构可能有问题');
        return;
    }
    
    const pagePath = `./page/${pageName}.html`;
    
    // 显示加载状态
    contentContainer.innerHTML = '<mdui-circular-progress></mdui-circular-progress><p>加载中...</p>';
    
    fetch(pagePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`页面加载失败: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            contentContainer.innerHTML = html;
            currentPage = pageName;
            
            // 重新初始化按钮事件
            initActionButtons();
            
            // 如果是追番页面，初始化追番功能
            if (pageName === 'chase') {
                setTimeout(() => {
                    if (typeof initChasePage === 'function') {
                        initChasePage();
                    }
                }, 50);
            }
            
            // 更新页面标题
            updatePageTitle(pageName);
        })
        .catch(error => {
            console.error('页面加载错误:', error);
            contentContainer.innerHTML = `
                <mdui-alert type="error" closeable>
                    <mdui-alert-title>页面加载失败</mdui-alert-title>
                    <mdui-alert-description>${error.message}</mdui-alert-description>
                </mdui-alert>
            `;
        });
}

/**
 * 更新页面标题
 * @param {string} pageName - 页面名称
 */
function updatePageTitle(pageName) {
    const titleMap = {
        'index': '首页',
        'chase': '追番'
    };
    
    const pageTitle = titleMap[pageName] || 'SakuraCake';
    document.title = `${pageTitle} - SakuraCake`;
}

/**
 * 处理按钮点击事件
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
v0.0.1 sorange.top
`);
}