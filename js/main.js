import browser from './lib/browser.min.js';
import {Fancybox} from './lib/fancybox/fancybox.esm.js';

window.ENV = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')? 'dev': 'prod';
// 深色模式切换
const themeToggles = document.querySelectorAll('.theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeIcons(savedTheme);
    } else if (prefersDarkScheme.matches) {
        document.body.setAttribute('data-theme', 'dark');
        updateThemeIcons('dark');
    }
}

function updateThemeIcons(theme) {
    themeToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
}

function initFancybox() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/js/lib/fancybox/fancybox.css'; // 注入fancybox的css
    document.head.appendChild(link);
    Fancybox.bind("[data-fancybox]", {});
}

// 为所有主题切换按钮添加事件监听
themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    });
});

// 移动端菜单切换
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// 点击导航链接后自动关闭菜单
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navLinks.classList.remove('active');
        }
    });
});

// 点击页面其他地方关闭菜单
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        !e.target.closest('.nav-links') && 
        !e.target.closest('.menu-toggle')) {
        navLinks.classList.remove('active');
    }
});

if(location.href.includes('download')) { // 下载页才执行
// 检测设备信息
async function detectDevice() {
    const deviceInfo = await browser.getInfo();
    if(window.ENV === 'dev') console.log('设备信息:', deviceInfo);
    let arcText = deviceInfo.system === 'Windows'?
        `${deviceInfo.architecture}_${deviceInfo.bitness}`:
        `${deviceInfo.platform.match(/aarch64|armv8|arm64/)? 'arm64':
            deviceInfo.platform.match(/aarch32|armv7|armeabi|arm(?!\d)+/)? 'arm32': 'unknown'}`;
    return document.querySelector('#device-info').innerHTML = `${deviceInfo.system} ${deviceInfo.systemVersion} ${arcText}`
}
let ghProxyUrl = '';

// 下载源配置
const downloadUrls = {
    all: {
        direct: 'http://fcl.asia/FCL-release-1.2.0.5-all.apk',
        '123': 'https://www.123684.com/s/zcTSVv-sGFO3',
        '八蓝米': 'https://alist.8mi.tech/FCL',
        'github': `https://github.com/FCL-Team/FoldCraftLauncher/releases/download/1.2.0.5/FCL-release-1.2.0.5-all.apk`
    },
    arm64: {
        direct: 'http://fcl.asia/FCL-release-1.2.0.5-arm64-v8a.apk',
        '123': 'https://www.123684.com/s/zcTSVv-sGFO3',
        '八蓝米': 'https://alist.8mi.tech/FCL',
        'github': `https://github.com/FCL-Team/FoldCraftLauncher/releases/download/1.2.0.5/FCL-release-1.2.0.4-arm64-v8a.apk`
    },
    x86: {
        direct: 'http://fcl.asia/FCL-release-1.2.0.5-x86.apk',
        '123': 'https://www.123684.com/s/zcTSVv-sGFO3',
        'github': `https://github.com/FCL-Team/FoldCraftLauncher/releases/download/1.2.0.5/FCL-release-1.2.0.5-x86.apk`
    },
    plugins: {
        direct: 'https://fcl.ningmo.fun/d/fcl渲染器插件.zip',
    },
    drive: {
        direct: 'https://fcl.ningmo.fun/qd/fcl驱动程序包.zip',
    }
};

// 初始化下载页
document.addEventListener('DOMContentLoaded', () => {
    detectDevice();
    const sourceSelects = document.querySelectorAll('.source-select');
    sourceSelects.forEach((select, index) => {
        const downloadButton = select.nextElementSibling;
        const version = ['all', 'arm64', 'x86', 'plugins', 'drive'][index];
        
        // 初始化下载链接
        downloadButton.href = downloadUrls[version][select.value];
        
        // 监听下载源切换
        select.addEventListener('change', () => {
            downloadButton.href = downloadUrls[version][select.value];
        });
    });
});
}

// 截图滚动指示器
function initScreenshotSlider() {
    const slider = document.querySelector('.screenshot-slider');
    const dots = document.querySelectorAll('.screenshot-dot');
    
    if (!slider || !dots.length) return;

    // 监听滚动更新指示器
    slider.addEventListener('scroll', () => {
        const scrollPosition = slider.scrollLeft;
        const itemWidth = slider.querySelector('.screenshot-item').offsetWidth;
        const activeIndex = Math.round(scrollPosition / itemWidth);
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    });

    // 点击指示器滚动到对应位置
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const itemWidth = slider.querySelector('.screenshot-item').offsetWidth;
            slider.scrollTo({
                left: itemWidth * index,
                behavior: 'smooth'
            });
        });
    });
}

// 数据源配置
const DATA_SOURCES = {
    plugins: '/plugins/plugins.json',
    drive: '/plugins/drive.json'
};

// 修改 loadPlugins 函数
async function loadPlugins() {
    const pluginsContainer = document.getElementById('plugins-container');
    const sourceSelect = document.getElementById('data-source');
    if (!pluginsContainer || !sourceSelect) return;

    const savedSource = localStorage.getItem('preferred-source') || 'github';
    sourceSelect.value = savedSource;

    async function fetchPluginsData() {
        pluginsContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>正在加载插件列表...</span>
            </div>
        `;

        try {
            // 先尝试主源
            let response = await fetch(DATA_SOURCES[sourceSelect.value], {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }).catch(() => null);



            if (!response.ok) {
                throw new Error(`HTTP 错误! 状态码: ${response.status}`);
            }

            const text = await response.text();
            console.log('响应内容类型:', response.headers.get('content-type'));
            console.log('响应长度:', text.length);
            console.log('响应内容:', text);
            
            let data;
            try {
                data = JSON.parse(text);
                console.log('解析后的数据:', data);
            } catch (e) {
                console.error('JSON 解析错误:', e);
                console.log('尝试解析的文本:', text);
                throw new Error(`JSON 解析错误: ${e.message}`);
            }
            
            if (!data || !data.plugins) {
                console.error('无效的数据结构:', data);
                throw new Error('数据格式无效: 缺少 plugins 数组');
            }

            // 渲染插件卡片
            pluginsContainer.innerHTML = '';
            data.plugins.forEach(plugin => {
                const latestVersion = plugin.versions.find(v => v.isLatest) || plugin.versions[0];
                
                // 优先使用 JSON 中的图标，如果没有则使用默认图标
                const defaultIcon = 'assets/images/logo.png';
                const iconUrl = plugin.icon || defaultIcon;
                
                const card = document.createElement('div');
                card.className = 'plugin-card';
                card.innerHTML = `
                    <div class="plugin-icon">
                        <img src="${iconUrl}" 
                             alt="${plugin.name}" 
                             draggable="false"
                             onerror="this.onerror=null; this.src='${defaultIcon}';">
                    </div>
                    <div class="plugin-info">
                        <h3>${plugin.name || '未命名插件'}</h3>
                        <p class="plugin-description">${plugin.description || '暂无描述'}</p>
                        <div class="plugin-meta">
                            <span class="version">v${latestVersion.version || '0.0.0'}</span>
                            <span class="size">${plugin.size || '未知大小'}</span>
                        </div>
                        <div class="plugin-versions">
                            <select class="version-select" title="选择版本">
                                ${plugin.versions.map(v => `
                                    <option value="${v.version}"${v.isLatest ? ' selected' : ''}>
                                        v${v.version}${v.isLatest ? ' (最新)' : ''}
                                    </option>
                                `).join('')}
                            </select>
                            <a href="${latestVersion.url}" 
                               class="download-button" 
                               data-plugin-id="${plugin.id}"
                               target="_blank"
                               rel="noopener noreferrer">
                                <i class="fas fa-download"></i>
                                下载
                            </a>
                        </div>
                    </div>
                `;
                
                // 添加版本切换事件
                const select = card.querySelector('.version-select');
                const downloadButton = card.querySelector('.download-button');
                select.addEventListener('change', () => {
                    const selectedVersion = plugin.versions.find(v => v.version === select.value);
                    if (selectedVersion) {
                        downloadButton.href = selectedVersion.url;
                    }
                });
                
                pluginsContainer.appendChild(card);
            });
            
        } catch (error) {
            console.error('完整错误信息:', error);
            pluginsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    加载插件列表失败: ${error.message}<br>
                    当前数据源: ${sourceSelect.value}<br>
                    请稍后重试
                    如未选择源，请先选择！
                </div>
            `;
        }
    }

    // 监听源选择变化
    sourceSelect.addEventListener('change', () => {
        localStorage.setItem('preferred-source', sourceSelect.value);
        fetchPluginsData();
    });

    // 初始加载
    fetchPluginsData();
}

// 在 DOMContentLoaded 事件中初始化
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScreenshotSlider();
    initFancybox();
    if (location.href.includes('plugins')) {
        loadPlugins();
    }
}); 