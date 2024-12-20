import browser from './lib/browser.min.mjs';
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
        direct: 'https://fcl.ningmo.fun/d/FCL-release-1.1.9.5-all.apk',
        '123': 'https://www.123684.com/s/zcTSVv-sGFO3',
        'github': `${ghProxyUrl}https://github.com/FCL-Team/FoldCraftLauncher/releases/download/1.1.9.5/FCL-release-1.1.9.5-all.apk`
    },
    arm64: {
        direct: 'https://fcl.ningmo.fun/d/FCL-release-1.1.9.5-arm64-v8a.apk',
        '123': 'https://www.123684.com/s/zcTSVv-sGFO3',
        'github': `${ghProxyUrl}https://github.com/FCL-Team/FoldCraftLauncher/releases/download/1.1.9.5/FCL-release-1.1.9.5-arm64-v8a.apk`
    },
    x86: {
        direct: 'https://fcl.ningmo.fun/d/FCL-release-1.1.9.5-x86.apk',
        '123': 'https://www.123684.com/s/zcTSVv-sGFO3',
        'github': `${ghProxyUrl}https://github.com/FCL-Team/FoldCraftLauncher/releases/download/1.1.9.5/FCL-release-1.1.9.5-x86.apk`
    }
};

// 初始化下载页
document.addEventListener('DOMContentLoaded', () => {
    detectDevice();
    const sourceSelects = document.querySelectorAll('.source-select');
    sourceSelects.forEach((select, index) => {
        const downloadButton = select.nextElementSibling;
        const version = ['all', 'arm64', 'x86'][index];
        
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

// 在DOMContentLoaded事件中初始化
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScreenshotSlider();
    initFancybox();
}); 