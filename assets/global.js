/* KAERONT GLOBAL STYLES AND HTML ELEMENTS */

const initialLoader = document.getElementById('loader-wrapper');
if (initialLoader) {
    initialLoader.style.animation = 'none';
}

// Работа с куки для сохранения темы
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

// Инициализация темы из куки до отрисовки
const savedTheme = getCookie('kaeront_theme');
if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
}

const globalStyles = `
    :root {
        --bg: #0a0a0a;
        --accent: #FA0;
        --text-main: #fff;
        --text-dim: #B3B3B3;
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        --nav-height: 50px;
        --nav-bg: rgb(10, 10, 10);
    }

    /* Светлая тема */
    html.light-theme, body.light-theme {
        --bg: #f4f4f5;
        --accent: #d97706;
        --text-main: #18181b;
        --text-dim: #71717a;
        --nav-bg: rgb(244, 244, 245);
    }

    body.light-theme::before {
        background-image: linear-gradient(rgba(255, 255, 255, 0.65)), url('/assets/blackstone_top.png');
    }

    body.light-theme nav.scrolled {
        border-bottom: 1.5px solid #e4e4e7;
    }

    body.light-theme body::-webkit-scrollbar-thumb {
        background-color: #d4d4d8;
    }

    body.light-theme body::-webkit-scrollbar-track {
        background-color: #f4f4f5;
    }

    html {
        padding-top: 0px;
        transition: padding-top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    ::selection { color: #000; background: var(--accent); }

    @font-face {
        font-family: 'Uniform';
        src: url('/assets/uniform.otf') format('opentype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
    }

    @font-face {
        font-family: 'Uniform Upper';
        src: url('/assets/uniform_upper.otf') format('opentype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
    }

    @font-face {
        font-family: 'Minecraft';
        src: url('/assets/minecraft.ttf') format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        size-adjust: 130%;
    }

    @font-face {
        font-family: 'Minecraft';
        src: url('/assets/minecraft-bold.ttf') format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        size-adjust: 130%;
    }

    body {
        background-color: var(--bg);
        color: var(--text-main);
        font-family: 'Montserrat', sans-serif;
        margin: 0;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        will-change: padding-top;
        transition: margin-top 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        position: relative;
        z-index: 0;
    }
    
    body::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background-image: linear-gradient(rgba(0, 5, 0, 0.65)), url('/assets/blackstone_top.png');
        background-size: 36px 36px;
        background-repeat: repeat;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        pointer-events: none; 
    }

    body::-webkit-scrollbar {
        width: 8px;
    }

    body::-webkit-scrollbar-thumb {
        background-color: #333;
        border-radius: 8px;
        z-index: 100000;
    }

    body::-webkit-scrollbar-track {
        background-color: #000;
        border-radius: 8px;
    }

    .a, button {
        cursor: url('/assets/pointer.png'), pointer;
    }

    body {
        cursor: url('/assets/cursor.png'), auto;
    }

    nav {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: var(--nav-height);
        background-color: transparent;
        backdrop-filter: blur(0px);
        border-bottom: 1.5px solid transparent; 
        display: flex; justify-content: space-between;
        align-items: center;
        padding: 0 5%;
        box-sizing: border-box;
        z-index: 2000;
        user-select: none;
        will-change: background, backdrop-filter, border-bottom, margin-top;
        transition: background-color 0.2s ease, backdrop-filter 0.2s ease, border-bottom 0.2s ease, margin-top 0.3s cubic-bezier(0.19, 1, 0.22, 1);
    }
    nav.scrolled {
        background-color: color-mix(in srgb, var(--nav-bg) 70%, transparent); 
        backdrop-filter: blur(5px);
        border-bottom: 1.5px solid #1a1a1a;
    }
    .nav-logo { font-family: 'Minecraft'; font-size: 0.75rem; color: var(--accent); text-decoration: none; font-weight: 700; }
    .nav-links { display: flex; gap: 10px; align-items: center; }
    .nav-links a, .theme-toggle-btn { color: var(--text-dim); text-decoration: none; font-size: 0.6rem; text-transform: uppercase; transition: 0.3s; font-weight: 600; background: none; border: none; cursor: pointer; padding: 0; }
    .nav-links a:hover, .theme-toggle-btn:hover { color: var(--accent); }
    .nav-links a span { display: inline-block; vertical-align: middle; line-height: 1; }
        
    footer { padding: 60px 20px; background: #050505c0; border-top: 1px solid #111; margin-top: auto; z-index: 500;}
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; }
    .footer-section h4 { font-family: 'Minecraft'; font-size: 0.7rem; color: var(--accent); margin-bottom: 20px; font-weight: 400; }
    .footer-links { list-style: none; padding: 0; margin: 0; }
    .footer-links li { margin-bottom: 10px; }
    .footer-links a { color: var(--text-dim); text-decoration: none; font-size: 0.8rem; transition: 0.3s; }
    .footer-links a:hover { color: var(--accent); }
    .footer-quote { font-size: 0.9rem; color: #ffffff; line-height: 1.6; }
    .copyright-bar { border-top: 1px solid #111; padding-top: 30px; margin-top: 40px; text-align: center; font-size: 0.65rem; color: #333; font-family: 'Minecraft'; }

    /* ИНТЕРНЕТ ПОП-АП */
    #speed-popup {
        position: fixed; top: 0; left: 0; width: 100%; height: 20px;
        color: #fff;
        z-index: 99998;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Montserrat', sans-serif; font-size: 0.6rem; font-weight: 600; letter-spacing: 0.03em;
        will-change: margin-top;
        transition: margin-top 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        margin-top: -20px;
        user-select: none;
    }
    
    #speed-popup.slow { background: #fa0; color: #000; }
    #speed-popup.offline { background: #a00; color: #fff; }
    #speed-popup.active { margin-top: 0px; }

    body:has(#speed-popup.active) { margin-top: 20px; }
    body:has(#speed-popup.active) nav { margin-top: 20px; }

    .nav-auth-icon { font-size: 24px !important; font-family: 'Uniform Upper' !important; font-weight: 400 !important; }
    .nav-user-head { width: 28px; height: 28px; transition: 0.1s transform; }
    .nav-user-head:hover { transform: scale(1.1); }
`;

const injectHTML = {
    dev: `
    <div id="dev-banner" style="user-select: none;pointer-events: none;bottom: 2%;position: fixed;width: 100%;padding: 0 1vw;opacity:0.3;z-index: 30000;box-sizing: border-box;text-align: center;">
      <p style="font-family: 'Montserrat', sans-serif; color: #888; font-size: 1vh; margin: 0;">
        <span style="font-family: 'Minecraft', sans-serif; color: #FFAA00;">Проект в разработке!</span> Серверы работают в тестовом режиме и временно могут быть недоступны. Пожалуйста, вернитесь к нам после официального релиза.
      </p>
    </div>
    `,

    nav: (() => {
        let authElement = `<a href="/login" class="nav-auth-icon" title="Войти">👤︎</a>`;
        const token = localStorage.getItem('kaeront_access_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 > Date.now() && payload.sub) {
                    authElement = `<a href="/user/${payload.sub}" title="Профиль"><img src="https://nmsr.nickac.dev/face/${payload.sub}" class="nav-user-head" alt="Профиль"></a>`;
                } else {
                    localStorage.removeItem('kaeront_access_token');
                }
            } catch (e) {
                localStorage.removeItem('kaeront_access_token');
            }
        }
        const currentThemeIcon = (getCookie('kaeront_theme') === 'light') ? '🌙' : '☀️';
        return `  
        <nav id="smart-nav">
            <a href="/" class="nav-logo">Kaeront</a>
            <div class="nav-links">
                <a href="https://t.me/KAmirWorkshop" target="_blank">Сникпики</a>
                <a href="/news">Новости</a>
                <a href="/archive">Архив <span style="color: var(--accent); font-family: 'Minecraft', sans-serif; font-weight: 400;">⚡︎</span></a>
                <a href="/donate" style="color: var(--accent);">Пожертвовать</a>
                <button type="button" id="theme-toggle-btn" class="theme-toggle-btn" onclick="toggleTheme()" title="Переключить тему">${currentThemeIcon}</button>
                ${authElement}
            </div>
        </nav>`;
    })(),

    footer: `
    <footer>
        <div class="footer-grid">
            <div class="footer-section">
                <h4 style="font-weight: 700;">Kaeront</h4>
                <p class="footer-quote">«Мы создаем качественное игровое пространство для тех, кто ценит Minecraft как искусство» — KAmir.</p>
            </div>
            <div class="footer-section">
                <h4>Документы</h4>
                <ul class="footer-links">
                    <li><a href="/privacy">Политика конфиденциальности и обработки персональных данных</a></li>
                    <li><a href="/offer">Публичная оферта</a></li>
                    <li><a href="/terms">Пользовательское соглашение</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Проект</h4>
                <ul class="footer-links">
                    <li><a href="/news">Новости</a></li>
                    <li><a href="/archive">Архив <span style="color: var(--accent); font-family: 'Minecraft', sans-serif; font-weight: 400;">⚡︎</span></a></li>
                    <li><a href="/donate">Пожертвовать</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Контакты</h4>
                <ul class="footer-links">
                    <li><a href="https://t.me/KaerontMC" target="_blank">@KaerontMC (Telegram) — поддержка</a></li>
                    <li><a href="mailto:support@kaeront.ru" target="_blank">support@kaeront.ru — поддержка</a></li>
                    <li><a href="mailto:admin@kaeront.ru" target="_blank">admin@kaeront.ru — важные вопросы</a></li>
                </ul>
            </div>
        </div>
        <div class="copyright-bar">Copyright © Kaeront 2026. All rights reserved.<br>NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT<br>Проект разработчика Амира «KAmir» Кашапова.</div>
    </footer>`
};

// Функция переключения темы с записью в куки
window.toggleTheme = function() {
    const isLight = document.documentElement.classList.toggle('light-theme');
    document.body.classList.toggle('light-theme', isLight);
    setCookie('kaeront_theme', isLight ? 'light' : 'dark', 365);
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = isLight ? '🌙' : '☀️';
};

// Применение темы при загрузке тела
document.addEventListener('DOMContentLoaded', () => {
    if (getCookie('kaeront_theme') === 'light') {
        document.documentElement.classList.add('light-theme');
        document.body.classList.add('light-theme');
    }
});

const setupHead = () => {
    const metaTags = [
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
      { name: 'theme-color', content: '#ffaa00' },
      { property: 'og:locale', content: 'ru-RU' },
      { property: 'og:url', content: 'https://kaeront.ru' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Kaeront — сеть уникальных Minecraft-серверов' },
      { property: 'og:description', content: 'Твой новый дом в мире Minecraft. Мы создали это место для дружелюбных, адекватных игроков, совместного творчества и для тех, кто ценит Minecraft как искусство.' },
      { property: 'og:image', content: 'https://kaeront.ru/preview.png' },
      { property: 'og:logo', content: 'https://kaeront.ru/island.png' }
    ];

    metaTags.forEach(tag => {
        const m = document.createElement('meta');
        Object.entries(tag).forEach(([k, v]) => m.setAttribute(k, v));
        document.head.appendChild(m);
    });

    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap';
    document.head.appendChild(fonts);

    const style = document.createElement('style')
    style.innerHTML = globalStyles;
    document.head.appendChild(style);

    const statusScript = document.createElement('script');
    statusScript.src = '/assets/online_status.js';
    statusScript.defer = true;
    document.head.appendChild(statusScript);
};

let networkDelayTimer = null;

const toggleSpeedPopup = (show, type = 'slow') => {
    clearTimeout(networkDelayTimer);
    const popup = document.getElementById('speed-popup');

    if (!show) {
        if (popup) {
            popup.classList.remove('active');
            setTimeout(() => {
                const currentPopup = document.getElementById('speed-popup');
                if (currentPopup && !currentPopup.classList.contains('active')) {
                    currentPopup.remove();
                }
            }, 300);
        }
        return;
    }

    const renderPopup = (statusType) => {
        let el = document.getElementById('speed-popup');
        if (!el) {
            el = document.createElement('div');
            el.id = 'speed-popup';
            document.body.appendChild(el);
        }

        if (statusType === 'offline') {
            el.innerHTML = `<span>Оборвана связь с Kaeront.</span>`;
            el.className = 'offline';
        } else {
            el.innerHTML = `<span>Ой-ой! Медленная связь!</span>`;
            el.className = 'slow';
        }

        requestAnimationFrame(() => {
            el.classList.add('active');
        });
    };

    if (type === 'offline') {
        renderPopup('offline');
        return;
    }

    if (popup && popup.classList.contains('offline') && popup.classList.contains('active')) {
        return;
    }

    networkDelayTimer = setTimeout(() => {
        if (!navigator.onLine) {
            renderPopup('offline');
        } else {
            renderPopup('slow');
        }
    }, 1000);
};

const evaluateNetwork = () => {
    if (!navigator.onLine) {
        toggleSpeedPopup(true, 'offline');
        return;
    }

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        const isSlowType = conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
        const isHighLatency = conn.rtt && conn.rtt > 600;
        const isLowSpeed = conn.downlink && conn.downlink > 0 && conn.downlink < 0.7;

        if (isSlowType || isHighLatency || isLowSpeed) {
            toggleSpeedPopup(true, 'slow');
            return;
        }
    }
    toggleSpeedPopup(false);
};

const startNetworkMonitoring = () => {
    evaluateNetwork();
    window.addEventListener('offline', () => toggleSpeedPopup(true, 'offline'));
    window.addEventListener('online', () => evaluateNetwork());

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        conn.addEventListener('change', evaluateNetwork);
    }
};

window.addEventListener('scroll', () => {
    const nav = document.getElementById('smart-nav');
    if (nav) {
        const navHideThreshold = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-hide')) || 0;
        if (window.scrollY >= navHideThreshold) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
});

setupHead();
document.addEventListener('DOMContentLoaded', () => {
    const containers = {
        'noscript-inject': injectHTML.noscript,
        'nav-inject': injectHTML.nav,
        'footer-inject': injectHTML.footer,
        'dev-inject': injectHTML.dev
    };

    Object.entries(containers).forEach(([id, html]) => {
        const el = document.getElementById(id);
        if (el) el.outerHTML = html;
    });

    startNetworkMonitoring();
});

window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        document.body.style.setProperty('overflow', 'auto', 'important');
        document.documentElement.style.overflow = 'auto'; 
        setTimeout(() => { loader.remove(); }, 500);
    }
});

const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => console.log('[SW] Зарегистрирован:', registration.scope))
                .catch((error) => console.error('[SW] Ошибка регистрации:', error));
        });
    }
};

registerServiceWorker();
