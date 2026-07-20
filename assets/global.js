/* KAERONT GLOBAL STYLES AND HTML ELEMENTS */

const initialLoader = document.getElementById('loader-wrapper');
if (initialLoader) {
    initialLoader.style.animation = 'none';
}

const globalStyles = `
    :root {
        --bg: #0a0a0a;
        --accent: #FA0;
        --text-main: #fff;
        --text-dim: #888;
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        --nav-height: 50px;
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
        background-image: url("data:image/svg+xml,%3Csvg width='32' height='64' viewBox='0 0 32 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 28h20V16h-4v8H4V4h28v28h-4V8H8v12h4v-8h12v20H0v-4zm12 8h20v4H16v24H0v-4h12V36zm16 12h-4v12h8v4H20V44h12v12h-4v-8zM0 36h8v20H0v-4h4V40H0v-4z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        color: var(--text-main);
        font-family: 'Montserrat', sans-serif;
        margin: 0;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
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
        position: fixed; top: 0; left: 0; width: 100%; height: var(--nav-height);
        background: transparent; backdrop-filter: blur(0px);
        border-bottom: 1.5px solid transparent; 
        display: flex; justify-content: space-between;
        align-items: center; padding: 0 5%; box-sizing: border-box; z-index: 2000;
        transition: var(--transition), top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
    }
    nav.scrolled {
        background: rgba(10, 10, 10, 0.7); 
        backdrop-filter: blur(5px);
        border-bottom: 1.5px solid #1a1a1a;
    }
    .nav-logo { font-family: 'Minecraft'; font-size: 0.75rem; color: var(--accent); text-decoration: none; font-weight: 700; }
    .nav-links { display: flex; gap: 10px; }
    .nav-links a { color: var(--text-dim); text-decoration: none; font-size: 0.6rem; text-transform: uppercase; transition: 0.3s; font-weight: 600; }
    .nav-links a:hover { color: var(--accent); }
    .nav-links a span { display: inline-block; vertical-align: middle; line-height: 1; }
        
    footer { padding: 60px 20px; background: #050505; border-top: 1px solid #111; margin-top: auto; z-index: 500;}
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
        position: fixed; top: 0; left: 0; width: 100%; height: 25px;
        color: #fff;
        z-index: 3001;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Montserrat', sans-serif; font-size: 0.65rem; font-weight: 600;
        transform: translateY(-100%); 
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
        user-select: none;
    }
    
    /* Состояние: Медленный интернет (Оранжево-желтый) */
    #speed-popup.slow {
        background: #FFAA00;
        color: #000;
    }

    /* Состояние: Нет подключения (Красный) */
    #speed-popup.offline {
        background: #FF5555;
        color: #fff;
    }

    #speed-popup.active { 
        transform: translateY(0); 
    }
`;

const injectHTML = {
    dev: `
    <div id="dev-banner" style="user-select: none; pointer-events: none; bottom: 2%; position: fixed; width: 100vh; padding: 0 0.1vh; opacity:0.3; z-index: 30000; box-sizing: border-box; justify-content: center; align-items: center; text-align: center;">
      <p style="font-family: 'Montserrat', sans-serif; color: #888; font-size: 1vh; margin: 0;">
        <span style="font-family: 'Minecraft', sans-serif; color: #FFAA00;">Проект в разработке!</span> Серверы работают в тестовом режиме и временно могут быть недоступны. Пожалуйста, вернитесь к нам после официального релиза.
      </p>
    </div>
    `,

    nav: `    
    <nav id="smart-nav">
        <a href="/" class="nav-logo">Kaeront</a>
        <div class="nav-links">
            <a href="/servers">Сервера</a>
            <a href="/news">Новости</a>
            <a href="/archive">Архив <span style="color: var(--accent); font-family: 'Minecraft', sans-serif; font-weight: 400;">⚡︎</span></a>
            <a href="/donate" style="color: var(--accent);">Пожертвовать</a>
        </div>
    </nav>`,

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

// Инициализация Head (Мета и Шрифты)
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
      { property: 'og:logo', content: 'https://kaeront.ru/palm.png' }
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
};

// Динамическое управление поп-апом интернета
let networkDelayTimer = null;

const toggleSpeedPopup = (show, type = 'slow') => {
    // Сбрасываем предыдущий таймер ожидания медленного соединения
    clearTimeout(networkDelayTimer);

    const applyVisibility = () => {
        let popup = document.getElementById('speed-popup');
        const nav = document.getElementById('smart-nav');

        if (show) {
            if (!popup) {
                popup = document.createElement('div');
                popup.id = 'speed-popup';
                document.body.appendChild(popup);
            }

            // Настраиваем контент и классы в зависимости от типа ошибки
            if (type === 'offline') {
                popup.innerHTML = `<span>Подключение к интернету отсутствует. Проверьте соединение.</span>`;
                popup.className = 'offline'; // Вешаем красный стиль
            } else {
                popup.innerHTML = `<span>Ой-ой! Зафиксировано медленное соединение!</span>`;
                popup.className = 'slow'; // Вешаем желтый стиль
            }

            // Форсируем микро-таймаут для плавного CSS-перехода
            setTimeout(() => {
                document.documentElement.style.paddingTop = '25px';
                if (nav) nav.style.top = '25px';
                popup.classList.add('active');
            }, 50);
        } else {
            if (popup) {
                popup.classList.remove('active');
                document.documentElement.style.paddingTop = '0px';
                if (nav) nav.style.top = '0px';
                setTimeout(() => popup.remove(), 300); // Чистим DOM после скрытия
            }
        }
    };

    if (type === 'offline') {
        // Если интернета вообще нет — показываем плашку моментально без задержек!
        applyVisibility();
    } else {
        // Если интернет просто просел по скорости — аккуратно ждем 1.5 сек перед показом
        networkDelayTimer = setTimeout(applyVisibility, 1500);
    }
};

// Функция оценки состояния сети
const evaluateNetwork = () => {
    // 1. Проверяем абсолютный офлайн
    if (!navigator.onLine) {
        toggleSpeedPopup(true, 'offline');
        return;
    }

    // 2. Проверяем просадку скорости
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        if (connection.effectiveType === '2g' || (connection.downlink && connection.downlink < 0.4)) {
            toggleSpeedPopup(true, 'slow');
            return;
        }
    }

    // Если всё восстановилось — плавно скрываем предупреждение
    toggleSpeedPopup(false);
};

// Живой мониторинг в реальном времени
const startNetworkMonitoring = () => {
    // Первичная проверка при загрузке страницы
    evaluateNetwork();

    // Мгновенная реакция на физическое отключение (без таймеров и задержек)
    window.addEventListener('offline', () => {
        toggleSpeedPopup(true, 'offline');
    });

    // Реакция на возвращение сети
    window.addEventListener('online', () => {
        evaluateNetwork();
    });

    // Отслеживание изменений скорости «на лету»
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        connection.addEventListener('change', evaluateNetwork);
    }
};

// Скролл навигации
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

// Сборка страницы
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

// Логика скрытия загрузочного экрана
window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';

        document.body.style.setProperty('overflow', 'auto', 'important');
        document.documentElement.style.overflow = 'auto'; 

        setTimeout(() => {
            loader.remove();
        }, 500);
    }
});