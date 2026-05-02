/**
 * KAERONT NETWORK GLOBAL BUNDLE
 * Architecture: KAmir Group
 */

const KAERONT_CONFIG = {
    ip: 'play.kaeront.ru'
};

const globalStyles = `
    :root {
        --bg: #0a0a0a;
        --accent: #FFAA00;
        --text-main: #ffffff;
        --text-dim: #888888;
        --line-color: rgba(40, 40, 40, 0.4);
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        --nav-height: 50px;
    }
    @font-face {
        font-family: 'Minecraft';
        src: url('minecraft.ttf') format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
    }

    body {
        background-color: var(--bg);
        background-image: url(https://transparenttextures.com/patterns/white-diamond-dark.png);
        background-size: 3vw 3vw;
        color: var(--text-main);
        font-family: 'Montserrat', sans-serif;
        margin: 0;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        min-height: 100vw
    }

    nav {
        position: fixed; top: 0; left: 0; width: 100%; height: var(--nav-height);
        background: transparent; backdrop-filter: blur(0px);
        border-bottom: 1.5px solid transparent; 
        display: flex; justify-content: space-between;
        align-items: center; padding: 0 5%; box-sizing: border-box; z-index: 2000;
        transition: var(--transition);
    }
    nav.scrolled {
        background: rgba(10, 10, 10, 0.7); 
        backdrop-filter: blur(5px);
        border-bottom: 1.5px solid #1a1a1a;
    }
    .nav-logo { font-family: 'Minecraft'; font-size: 0.75rem; color: var(--accent); text-decoration: none; user-select: none }
    .nav-links { display: flex; gap: 10px; }
    .nav-links a { color: var(--text-dim); text-decoration: none; font-size: 0.6rem; text-transform: uppercase; transition: 0.3s; font-weight: 600; }
    .nav-links a:hover { color: var(--accent); }
        
    footer { padding: 60px 20px; background: #050505; border-top: 1px solid #111; margin-top: auto; }
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; }
    .footer-section h4 { font-family: 'Minecraft'; font-size: 0.7rem; color: var(--accent); margin-bottom: 20px; }
    .footer-links { list-style: none; padding: 0; margin: 0; }
    .footer-links li { margin-bottom: 10px; }
    .footer-links a { color: var(--text-dim); text-decoration: none; font-size: 0.8rem; transition: 0.3s; }
    .footer-links a:hover { color: var(--accent); }
    .footer-quote { font-size: 0.9rem; color: #ffffff; line-height: 1.6; }
    .copyright-bar { border-top: 1px solid #111; padding-top: 30px; margin-top: 40px; text-align: center; font-size: 0.65rem; color: #333; font-family: 'Minecraft'; }
`;

const injectHTML = {
    noscript: `
      <noscript>
        <div style="
            position: fixed; 
            top: 0; left: 0; 
            width: 100vw; height: 100vh; 
            background: #0a0a0a; 
            color: white; 
            z-index: 9999; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            text-align: center; 
            font-family: 'Montserrat', sans-serif;
            padding: 20px;
            box-sizing: border-box;
            overflow: hidden;
        ">
            <h2 style="font-family: 'Minecraft'; color: #FA0; font-weight: 400; margin-bottom: 20px;">Включите JavaScript</h2>
            
            <p style="max-width: 500px; line-height: 1.6; color: #888; margin-bottom: 30px;">
                Для корректной работы сайта <b>Kaeront</b>, стабильного отображения контента, анимаций и переходов необходимо включить поддержку JavaScript на вашем браузере. Без него большинство функций будет недоступно. Данное предупреждение скрыть невозможно, из-за не работы скриптов, как раз таки. ¯\_(ツ)_/¯
            </p>
        </div>
        
        <style>
            body { overflow: hidden !important; }
        </style>
      </noscript>`,

    dev: `
    <div id="dev-banner" style="user-select: none; pointer-events: none; bottom: 2%; position: fixed; width: 100%; opacity:0.5; z-index: 3000; padding: 0.2vw; box-sizing: border-box; justify-content: center; align-items: center; text-align: center;">
      <p style="margin: 0; font-family: 'Montserrat', sans-serif; color: #888; font-size: 0.6vw;">
        <span style="font-family: 'Minecraft', sans-serif; color: #FFAA00; text-transform: uppercase; letter-spacing: 0.2vw; ">Проект в разработке!</span> Сайт и сервера временно работают в тестовом режиме и могут быть <b>недоступны 24/7</b>. Пожалуйста, вернитесь намного позже, когда мы завершим настройку инфраструктуры.
      </p>
    </div>
    `,

    nav: `    
    <nav id="smart-nav">
        <a href="/" class="nav-logo">Kaeront</a>
        <div class="nav-links">
            <a href="/servers">Сервера</a>
            <a href="/news">Новости</a>
            <a href="${KAERONT_CONFIG.tg}" target="_blank">Поддержка</a>
            <a href="/donate" style="color: var(--accent);">Пожертвовать</a>
        </div>
    </nav>`,
    
    footer: `
    <footer>
        <div class="footer-grid">
            <div class="footer-section">
                <h4>KAERONT</h4>
                <p class="footer-quote">«Мы создаем качественное игровое пространство для тех, кто ценит Minecraft как искусство» — KAmir.</p>
            </div>
            <div class="footer-section">
                <h4>ДОКУМЕНТЫ</h4>
                <ul class="footer-links">
                    <li><a href="privacy">Политика конфиденциальности и обработки персональных данных</a></li>
                    <li><a href="offer">Публичная оферта</a></li>
                    <li><a href="terms">Пользовательское соглашение</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>ПРОЕКТ</h4>
                <ul class="footer-links">
                    <li><a href="news">Новости</a></li>
                    <li><a href="donate">Пожертвовать</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>КОНТАКТЫ</h4>
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
      { name: 'theme-color', content: KAERONT_CONFIG.accent },
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

// Скролл навигации
window.addEventListener('scroll', () => {
    const nav = document.getElementById('smart-nav');
    if (nav) {
        if (window.scrollY > 30) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
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
});
