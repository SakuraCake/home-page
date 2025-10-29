/**
 * SakuraCake 个人主页 - 主脚本文件
 * 初始化页面交互功能
 */

let currentPage;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initActionButtons();
    showWelcomeLog();
    loadPage('index');
});

/**
 * 初始化导航功能
 */
function initNavigation() {
    const navigationDrawer = document.getElementById('navigation-drawer');
    const menuButton = document.getElementById('menu-button');
    const navItems = document.querySelectorAll('#navigation-drawer mdui-list-item');

    const isDesktop = window.innerWidth >= 800;
    navigationDrawer.open = false;

    let userManuallyOpened = false;

    const toggleDrawer = () => {
        navigationDrawer.open = !navigationDrawer.open;
        if (navigationDrawer.open) {
            userManuallyOpened = true;
        }
    };

    menuButton.addEventListener('click', toggleDrawer);

    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            switch (index) {
                case 0:
                    loadPage('index');
                    break;
                case 1:
                    loadPage('chase');
                    break;
                case 2:
                    break;
            }
            if (!isDesktop || !userManuallyOpened) {
                navigationDrawer.open = false;
            }
        });
    });

    window.addEventListener('resize', () => {
        if (!userManuallyOpened) {
            const currentIsDesktop = window.innerWidth >= 768;
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

    if (bilibili_button) {
        bilibili_button.addEventListener('click', () => {
            handleButtonClick('Bilibili按钮被点击');
        });
    }

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
    if (currentPage === pageName) return;

    const contentContainer = document.querySelector('.centered-content');

    if (!contentContainer) {
        console.error('内容容器未找到，页面结构可能有问题');
        return;
    }

    const pagePath = `./page/${pageName}.html`;

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

            initActionButtons();

            if (pageName === 'chase') {
                setTimeout(() => {
                    if (typeof initChasePage === 'function') {
                        initChasePage();
                    }
                }, 50);
            }

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
    console.log(`页面${pageName}加载完成`);
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