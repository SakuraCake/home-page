document.addEventListener('DOMContentLoaded', () => {
    // 获取核心元素
    const navigationDrawer = document.getElementById('navigation-drawer');
    const menuButton = document.getElementById('menu-button');
    const moreActionsButton = document.getElementById('more-actions');

    // 预留其他功能按钮
    const actionButton1 = document.getElementById('action-button-1');
    const actionButton2 = document.getElementById('action-button-2');

    // 验证核心元素是否存在
    if (!navigationDrawer) {
        console.error('未找到侧边抽屉栏元素');
        return;
    }

    if (!menuButton) {
        console.error('未找到菜单按钮元素');
        return;
    }

    // 抽屉栏控制函数
    const toggleDrawer = () => {
        navigationDrawer.open = !navigationDrawer.open;
    };

    // 菜单按钮事件 - 控制抽屉栏开关
    menuButton.addEventListener('click', toggleDrawer);

    // 更多操作按钮预留逻辑
    if (moreActionsButton) {
        moreActionsButton.addEventListener('click', () => {
            console.log('更多操作按钮被点击');
            // 预留功能：可以在这里添加菜单、对话框等
            // 例如：mdui.dialog({...});
        });
    }

    // 预留功能按钮1的逻辑
    if (actionButton1) {
        actionButton1.addEventListener('click', () => {
            console.log('功能按钮1被点击');
            // 预留具体功能逻辑
        });
    }

    // 预留功能按钮2的逻辑
    if (actionButton2) {
        actionButton2.addEventListener('click', () => {
            console.log('功能按钮2被点击');
            // 预留具体功能逻辑
        });
    }

    // ESC键关闭抽屉栏（备用）
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navigationDrawer.open) {
            navigationDrawer.open = false;
        }
    });

    // 点击遮罩层关闭抽屉栏（由MDUI自动处理，这里作为备用）
    navigationDrawer.addEventListener('overlay-click', () => {
        navigationDrawer.open = false;
    });
});

// 控制台日志，用于调试
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