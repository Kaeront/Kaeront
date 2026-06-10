/* ==========================================================================
   KAERONT WIKI ENGINE — ENGINE V1.0 (wiki-global.js)
   Разработано KAmir Group (ka:group)
   ========================================================================== */

// 1. ВИРТУАЛЬНАЯ ФАЙЛОВАЯ СТРУКТУРА WIKI
const WIKI_STRUCTURE = [
    {
        type: "folder",
        name: "Kaeront: Survival",
        children: [
            { type: "file", name: "Обзор режима", path: "survival/overview" },
            {
                type: "folder",
                name: "Gameplay",
                children: [
                    { type: "file", name: "Происхождения", path: "survival/gameplay/origins" },
                    { type: "file", name: "Система Улучшений", path: "survival/gameplay/upgrades" },
                    { type: "file", name: "Механика Веса предметов", path: "survival/gameplay/weight" }
                ]
            },
            {
                type: "folder",
                name: "Documents",
                children: [
                    { type: "file", name: "Глобальные Правила", path: "survival/docs/rules" },
                    { type: "file", name: "Пользовательское Соглашение", path: "survival/docs/terms" }
                ]
            }
        ]
    },
    {
        type: "folder",
        name: "Проект FYGHTING",
        children: [
            { type: "file", name: "О концепции боевой системы", path: "fyghting/about" },
            { type: "file", name: "Музыкальный саундтрек (Vol. 1)", path: "fyghting/ost" }
        ]
    },
    { type: "file", name: "Общие вопросы (FAQ)", path: "faq" }
];

// 2. ГЛОБАЛЬНЫЕ СТИЛИ И ДИЗАЙН ИНТЕРФЕЙСА (Интегрировано и расширено)
const wikiStyles = `
    :root {
        --bg: #0a0a0a;
        --accent: #FA0;
        --text-main: #fff;
        --text-dim: #888;
        --line-color: #1a1a1a;
        --sidebar-bg: rgba(12, 12, 12, 0.6);
        --viewport-bg: rgba(18, 18, 18, 0.4);
        --transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        --transition-fade: opacity 0.35s ease-in-out, transform 0.35s ease-in-out;
        --nav-height: 60px;
    }
    
    @font-face {
        font-family: 'Minecraft';
        src: url('/assets/minecraft.ttf') format('truetype');
        font-weight: 400; font-style: normal; font-display: swap; size-adjust: 140%; 
    }
    @font-face {
        font-family: 'Minecraft';
        src: url('/assets/minecraft-bold.ttf') format('truetype');
        font-weight: 700; font-style: normal; font-display: swap; size-adjust: 140%; 
    }

    body {
        background-color: var(--bg);
        background-image: url("data:image/svg+xml,%3Csvg width='32' height='64' viewBox='0 0 32 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 28h20V16h-4v8H4V4h28v28h-4V8H8v12h4v-8h12v20H0v-4zm12 8h20v4H16v24H0v-4h12V36zm16 12h-4v12h8v4H20V44h12v12h-4v-8zM0 36h8v20H0v-4h4V40H0v-4z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
        color: var(--text-main);
        font-family: 'Montserrat', sans-serif;
        margin: 0; padding: 0;
        overflow-x: hidden;
        display: flex; flex-direction: column; min-height: 100vh;
        cursor: url('/assets/cursor.png'), auto;
    }

    a, button { cursor: url('/assets/pointer.png'), pointer; }

    /* КАСТОРМНЫЙ NAV ДЛЯ ВИКИ */
    .wiki-nav {
        position: fixed; top: 0; left: 0; width: 100%; height: var(--nav-height);
        background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(12px);
        border-bottom: 1.5px solid var(--line-color);
        display: flex; justify-content: space-between; align-items: center;
        padding: 0 4%; box-sizing: border-box; z-index: 2100;
    }
    .nav-left { display: flex; align-items: center; gap: 15px; }
    .wiki-menu-toggle {
        background: none; border: none; padding: 5px; display: flex; flex-direction: column; gap: 5px;
    }
    .wiki-menu-toggle span {
        display: block; width: 22px; height: 2px; background: var(--text-main); transition: var(--transition);
    }
    .wiki-menu-toggle.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .wiki-menu-toggle.active span:nth-child(2) { opacity: 0; }
    .wiki-menu-toggle.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    
    .wiki-logo { font-family: 'Minecraft'; font-size: 1.1rem; color: var(--accent); text-decoration: none; font-weight: 700; letter-spacing: 1px; }
    .wiki-nav-links { display: flex; gap: 25px; }
    .wiki-nav-links a { color: var(--text-dim); text-decoration: none; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; transition: 0.3s; }
    .wiki-nav-links a:hover, .wiki-nav-links a.active { color: var(--accent); }

    /* НАВИГАЦИОННАЯ ПАНЕЛЬ ДЛЯ МОБИЛОК */
    .reachability-nav {
        position: fixed; top: calc(-100vh); left: 0; width: 100%; height: 60vh;
        background: rgba(14, 14, 14, 0.96); backdrop-filter: blur(20px);
        border-bottom: 2px solid var(--accent); z-index: 2050;
        transition: var(--transition);
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 25px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.8);
    }
    .reachability-nav.open { top: 0; transform: translateY(0); }
    .reachability-nav .reach-logo { font-family: 'Minecraft'; font-size: 1.5rem; color: var(--accent); margin-bottom: 10px; }
    .reachability-nav a { color: var(--text-main); text-decoration: none; font-size: 1.1rem; font-weight: 500; font-family: 'Minecraft'; transition: 0.3s; }
    .reachability-nav a:hover { color: var(--accent); }

    /* ОСНОВНАЯ СЕТКА СТРАНИЦЫ */
    .wiki-wrapper {
        padding-top: var(--nav-height);
        display: flex; flex-grow: 1; width: 100%; box-sizing: border-box;
    }
    .wiki-layout {
        display: grid; grid-template-columns: 320px 1fr; width: 100%; max-width: 1600px; margin: 0 auto;
    }

    /* БОКОВАЯ ПАНЕЛЬ С ДЕРЕВОМ НАВИГАЦИИ */
    .wiki-sidebar {
        background: var(--sidebar-bg); border-right: 1.5px solid var(--line-color);
        padding: 40px 25px; height: calc(100vh - var(--nav-height));
        position: sticky; top: var(--nav-height); overflow-y: auto; box-sizing: border-box;
    }
    .sidebar-header {
        font-family: 'Minecraft'; font-size: 0.85rem; color: var(--accent);
        text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; border-bottom: 1px solid #222; padding-bottom: 10px;
    }

    /* ДЕРЕВО ПАПОК И ФАЙЛОВ */
    .tree-nav ul { list-style: none; padding-left: 15px; margin: 5px 0; border-left: 1px dashed #222; }
    .tree-nav > ul { padding-left: 0; border-left: none; }
    .tree-node { display: flex; align-items: center; padding: 6px 0; font-size: 0.85rem; color: var(--text-main); user-select: none; }
    
    .folder-node { font-weight: 600; color: #e0e0e0; font-family: 'Montserrat'; cursor: pointer; }
    .folder-node::before { content: '📁'; margin-right: 8px; font-size: 0.8rem; opacity: 0.7; transition: 0.3s; }
    .folder-node.expanded::before { content: '📂'; }
    
    .file-node { color: var(--text-dim); text-decoration: none; transition: 0.25s; display: block; padding: 5px 0 5px 5px; }
    .file-node::before { content: '📄'; margin-right: 8px; opacity: 0.5; font-size: 0.75rem; }
    .file-node:hover, .file-node.active { color: var(--accent); background: rgba(255,170,0,0.04); padding-left: 10px; border-left: 2px solid var(--accent); }

    /* ГЛАВНЫЙ ВЬЮПОРТ РЕНДЕРА ТЕКСТА */
    .wiki-main-viewport {
        padding: 50px 60px; position: relative; background: var(--viewport-bg);
        box-sizing: border-box; min-height: calc(100vh - var(--nav-height));
    }
    
    /* СЛОЙ ЗАТУХАНИЯ (FADE OUT EFFECT) */
    .viewport-overlay {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: #121212; opacity: 0; pointer-events: none;
        transition: opacity 0.3s ease-in-out; z-index: 10;
    }
    .viewport-overlay.active { opacity: 0.85; pointer-events: auto; }

    /* СТИЛИЗАЦИЯ СКОМПИЛИРОВАННОГО MARKDOWN */
    .markdown-body {
        max-width: 850px; margin: 0 auto; line-height: 1.7; font-size: 0.95rem;
        transition: var(--transition-fade); opacity: 1; transform: translateY(0);
    }
    .markdown-body.loading { opacity: 0; transform: translateY(15px); }

    .markdown-body h1 { font-family: 'Minecraft'; font-size: 1.8rem; color: var(--accent); margin-top: 0; margin-bottom: 25px; border-bottom: 2px solid var(--line-color); padding-bottom: 15px; }
    .markdown-body h2 { font-family: 'Minecraft'; font-size: 1.25rem; color: var(--text-main); margin-top: 35px; margin-bottom: 15px; border-left: 3px solid var(--accent); padding-left: 12px; }
    .markdown-body h3 { font-family: 'Minecraft'; font-size: 0.95rem; color: var(--accent); margin-top: 25px; }
    .markdown-body p { color: #ccc; margin-bottom: 20px; text-align: justify; }
    
    /* СТИЛИЗАЦИЯ ТАБЛИЦ ХАРАКТЕРИСТИК (Дорогой игровой UI) */
    .markdown-body table { width: 100%; border-collapse: collapse; margin: 30px 0; background: rgba(15,15,15,0.6); border: 1px solid #1c1c1c; }
    .markdown-body th { background: rgba(255, 170, 0, 0.08); font-family: 'Minecraft'; font-size: 0.75rem; color: var(--accent); text-transform: uppercase; padding: 12px 16px; border: 1px solid #1c1c1c; text-align: left; }
    .markdown-body td { padding: 12px 16px; border: 1px solid #1c1c1c; color: #e0e0e0; font-size: 0.85rem; }
    .markdown-body tr:hover { background: rgba(255,255,255,0.02); }

    /* СПИСКИ */
    .markdown-body ul, .markdown-body ol { padding-left: 20px; margin-bottom: 20px; color: #ccc; }
    .markdown-body li { margin-bottom: 8px; }

    /* БЛОКИ КАТЕГОРИЙ / ПРЕДУПРЕЖДЕНИЙ */
    .markdown-callout {
        background: rgba(255, 170, 0, 0.03); border: 1px solid rgba(255, 170, 0, 0.15);
        border-left: 4px solid var(--accent); padding: 20px; margin: 25px 0; position: relative;
    }
    .markdown-callout-title { font-family: 'Minecraft'; font-size: 0.8rem; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }

    /* ФУТЕР СЕТИ */
    footer { padding: 60px 20px; background: #050505; border-top: 1px solid #111; margin-top: auto; z-index: 100; }
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; }
    .footer-section h4 { font-family: 'Minecraft'; font-size: 0.7rem; color: var(--accent); margin-bottom: 20px; font-weight: 400; }
    .footer-links { list-style: none; padding: 0; margin: 0; }
    .footer-links li { margin-bottom: 10px; }
    .footer-links a { color: var(--text-dim); text-decoration: none; font-size: 0.8rem; transition: 0.3s; }
    .footer-links a:hover { color: var(--accent); }
    .copyright-bar { border-top: 1px solid #111; padding-top: 30px; margin-top: 40px; text-align: center; font-size: 0.65rem; color: #333; font-family: 'Minecraft'; }

    /* АДАПТИВНОСТЬ ПОД СМАРТФОНЫ И ПЛАНШЕТЫ */
    @media (max-width: 992px) {
        .wiki-layout { grid-template-columns: 1fr; }
        .wiki-sidebar { display: none; height: auto; position: static; padding: 20px; }
        .wiki-sidebar.mobile-visible { display: block; position: fixed; top: var(--nav-height); left: 0; width: 100%; height: calc(100vh - var(--nav-height)); z-index: 2000; background: #0a0a0afb; backdrop-filter: blur(10px); }
        .wiki-main-viewport { padding: 30px 20px; }
        .wiki-nav-links { display: none; }
    }
`;

// Блоки инъекций базовой разметки навигации и подвала
const injectHTML = {
    nav: `
    <nav class="wiki-nav">
        <div class="nav-left">
            <button class="wiki-menu-toggle" id="menuToggle" aria-label="Меню">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <a href="/" class="wiki-logo">Kaeront <span style="font-size:0.6rem; vertical-align:super; color:var(--text-dim);">WIKI</span></a>
        </div>
        <div class="wiki-nav-links">
            <a href="https://kaeront.ru/servers">Сервера</a>
            <a href="https://kaeront.ru/news">Новости</a>
            <a href="https://kaeront.ru/donate">Поддержать</a>
        </div>
    </nav>
    <div class="reachability-nav" id="reachNav">
        <div class="reach-logo">Kaeront</div>
        <a href="/" class="spa-trigger">Wiki</a>
        <a href="https://kaeront.ru/servers">Сервера</a>
        <a href="https://kaeront.ru/news">Новости</a>
        <a href="https://kaeront.ru/donate">Пожертвования</a>
    </div>
    `,
    footer: `
    <footer>
        <div class="footer-grid">
            <div class="footer-section">
                <h4>Документы</h4>
                <ul class="footer-links">
                    <li><a href="https://kaeront.ru/terms">Соглашение</a></li>
                    <li><a href="https://kaeront.ru/privacy">Конфиденциальность</a></li>
                    <li><a href="https://kaeront.ru/offer">Публичная оферта</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Связь</h4>
                <ul class="footer-links">
                    <li><a href="https://t.me/KaerontMC" target="_blank">Telegram Техподдержка</a></li>
                    <li><a href="mailto:admin@kaeront.ru">admin@kaeront.ru</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <p class="footer-quote" style="font-size:0.75rem; color:#666; font-family:'Minecraft';">МЕСТО, ГДЕ ТВОЕ ПРОИСХОЖДЕНИЕ ИМЕЕТ ВЕС.</p>
            </div>
        </div>
        <div class="copyright-bar">© 2026 KAmir Interactive (ka:group). All rights reserved. Kaeront is not affiliated with Mojang AB.</div>
    </footer>
    `,
    dev: `
    <div id="dev-banner" style="user-select: none; pointer-events: none; bottom: 2%; position: fixed; width: 100%; opacity:0.4; z-index: 3000; text-align: center;">
      <p style="margin: 0; font-family: 'Montserrat', sans-serif; color: #888; font-size: 10px;">
        <span style="font-family: 'Minecraft', sans-serif; color: #FFAA00; letter-spacing: 1px;">WIKI ENGINE SSPA</span> v1.0 • Работает на лету
      </p>
    </div>
    `
};

// 3. ИНЪЕКЦИЯ СТИЛЕЙ В HEAD
const setupHead = () => {
    const style = document.createElement('style');
    style.textContent = wikiStyles;
    document.head.appendChild(style);
};

// 4. УЛЬТРА-ЛЕГКИЙ СВЕРХБЫСТРЫЙ MARKDOWN ПАРСЕР (Рендеринг на клиенте)
function parseMarkdown(md) {
    let html = md;
    
    // Экранирование HTML тегов во избежание XSS
    html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Кастомный синтаксис каллаутов: -# Заголовок \\n Текст
    html = html.replace(/-# ([^\n]+)\n([\s\S]*?)(?=\n-#|\n##|\n#|$)/g, function(match, title, content) {
        return `<div class="markdown-callout"><div class="markdown-callout-title">${title}</div><div>${content.trim().replace(/\n/g, '<br>')}</div></div>`;
    });

    // Заголовки
    html = html.replace(/^# ([^\n]+)/gm, '<h1>$1</h1>');
    html = html.replace(/^## ([^\n]+)/gm, '<h2>$1</h2>');
    html = html.replace(/^### ([^\n]+)/gm, '<h3>$1</h3>');

    // Жирный и курсив
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Списки (Маркированные)
    html = html.replace(/^\s*-\s+([^\n]+)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // Удаляем дублирующиеся вложенные ul, если регулярка склеила слишком много
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Таблицы (Формат | Название | Значение |)
    let lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('|')) {
            if (!inTable) {
                inTable = true;
                tableHtml = '<table>';
            }
            let cells = line.split('|').map(c => c.trim()).filter((c, index, arr) => index > 0 && index < arr.length - 1);
            
            // Проверка на разделительную строку таблиц (---)
            if (line.includes('---')) continue;

            tableHtml += '<tr>';
            cells.forEach(cell => {
                if (line.includes('==') || i === 0 || !html.includes('<table>')) { // Условный заголовок
                    tableHtml += `<th>${cell}</th>`;
                } else {
                    tableHtml += `<td>${cell}</td>`;
                }
            });
            tableHtml += '</tr>';
            lines[i] = '';
        } else {
            if (inTable) {
                inTable = false;
                tableHtml += '</table>';
                lines[i] = tableHtml + '\n' + lines[i];
            }
        }
    }
    html = lines.join('\n');

    // Абзацы текста (все, что не обернуто в теги блоков)
    html = html.split('\n\n').map(p => {
        let trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li') || trimmed.startsWith('<table') || trimmed.startsWith('<div')) {
            return trimmed;
        }
        return `<p>${trimmed}</p>`;
    }).join('\n');

    return html;
}

// 5. ГЕНЕРАЦИЯ ДЕРЕВА НАВИГАЦИИ НА ЛЕТУ
function buildTree(nodes, container) {
    const ul = document.createElement('ul');
    nodes.forEach(node => {
        const li = document.createElement('li');
        if (node.type === 'folder') {
            const div = document.createElement('div');
            div.className = 'tree-node folder-node';
            div.textContent = node.name;
            
            const childContainer = document.createElement('div');
            childContainer.style.display = 'block'; // Развернуто по дефолту
            div.classList.add('expanded');

            div.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = childContainer.style.display === 'none';
                childContainer.style.display = isHidden ? 'block' : 'none';
                div.classList.toggle('expanded', isHidden);
            });

            li.appendChild(div);
            buildTree(node.children, childContainer);
            li.appendChild(childContainer);
        } else if (node.type === 'file') {
            const a = document.createElement('a');
            a.className = 'tree-node file-node spa-trigger';
            a.href = `/${node.path}`;
            a.textContent = node.name;
            a.setAttribute('data-path', node.path);
            
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadArticle(node.path);
            });
            li.appendChild(a);
        }
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

// 6. ИНТЕЛЛЕКТУАЛЬНЫЙ СИСТЕМНЫЙ ЗАГРУЗЧИК СТАТЕЙ (SPA)
try {
    const response = await fetch(`/articles/${path}.md`);
    
    let markdownText = "";
    if (response.ok) {
        markdownText = await response.text();
    } else {
        markdownText = generateTestPageData(path);
    }

    setTimeout(() => {
        wikiContent.innerHTML = parseMarkdown(markdownText);
        if (viewportOverlay) viewportOverlay.classList.remove('active');
        wikiContent.classList.remove('loading');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);

    } catch (err) {
        wikiContent.innerHTML = `<h1>Ошибка загрузки</h1><p>Не удалось получить данные.</p>`;
        if (viewportOverlay) viewportOverlay.classList.remove('active');
        wikiContent.classList.remove('loading');
    }
}

// ГЕНЕРАТОР ТЕСТОВЫХ СТРАНИЦ НА ЛЕТУ (Если .md файлов еще нет в каталоге /articles/)
function generateTestPageData(path) {
    if (path.includes('origins')) {
        return `# Система Происхождения (Origins)\nВ Kaeront: Legends ваш персонаж выбирает свою жизненную стезю раз и навсегда.\n\n## Доступные Расы\n\n| Происхождение | Иммунитеты | Уязвимости | Особенность |\n| Незерянин | Огонь, Лава, Магма | Холодные биомы (-75% хп) | Меч поглощает жар |\n| Эндермен | Падение, Жемчуг | Вода, Дождь | Телепортация на 5 блоков |\n| Житель Хаба | Скидки у NPC | Урон увеличен ночью | Компас судьбы |\n\n-# Предупреждение Администрации\nПри смене происхождения у администратора ваш уровень сбрасывается до 0! Все ваши улучшения обнуляются, так как вы буквально переписываете свою судьбу.`;
    }
    if (path.includes('upgrades')) {
        return `# Прогрессия и Жетоны Улучшений\nЗабудьте классические чары! В KL улучшения привязываются непосредственно к душе игрока через **Жетоны Улучшений**.\n\n## Как это работает?\n1. Вы берете квест у NPC в безопасном городе.\n2. Выполняете его и возвращаетесь.\n3. Получаете Жетон и вкладываете его в тип предметов (например, вся Незеритовая броня).\n\n### Пример:\nЕсли вы прокачали параметр **Вместимость**, вместимость всех мешков в вашем инвентаре увеличивается на +1 предмет за уровень прокачки. При этом, если вы отдадите этот мешок другу, у него он будет работать по уровню ЕГО личной прокачки.`;
    }
    if (path.includes('rules')) {
        return `# Глобальный Свод Правил Сети\nДобро пожаловать в юридический регламент Kaeront.\n\n## 1. Общие положения\n1.1. Запрещено использование стороннего софта (читов, макросов), нарушающего баланс RPG-механик.\n1.2. Оскорбление игроков в безопасной зоне наказывается временной блокировкой чата.\n\n## 2. Экономика Хаба\n2.1. Запрещены любые махинации с Жетонами Улучшений. Попытки обхода механики веса будут расценены как дюп.`;
    }
    // Дефолтная заглушка
    return `# Статья: ${path}\nКонтент для данного раздела сейчас пишется нашей командой сценаристов.\n\n## Что тут будет?\nЗдесь появится детальное описание для ветки \`${path}\`, оформленное в уникальном лорном стиле Kaeront: Legends. Пожалуйста, зайдите позже.`;
}

// 7. ИНИЦИАЛИЗАЦИЯ И ОБРАБОТКА ИНТЕРФЕЙСА (Анимации меню)
setupHead();

document.addEventListener('DOMContentLoaded', () => {
    // Инъекция HTML структуры
    const containerNav = document.getElementById('wiki-nav-inject');
    const containerFooter = document.getElementById('footer-inject');
    const containerDev = document.getElementById('dev-inject');

    if (containerNav) containerNav.outerHTML = injectHTML.nav;
    if (containerFooter) containerFooter.outerHTML = injectHTML.footer;
    if (containerDev) containerDev.outerHTML = injectHTML.dev;

    // Сборка динамического дерева навигации
    const treeContainer = document.getElementById('wikiTreeNav');
    if (treeContainer) {
        buildTree(WIKI_STRUCTURE, treeContainer);
    }

    // Инициализация кастомного меню навигации (Три полоски)
    const menuToggle = document.getElementById('menuToggle');
    const reachNav = document.getElementById('reachNav');

    if (menuToggle && reachNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            reachNav.classList.toggle('open');
            
            // Эффект плавного смещения основного контента вниз
            const mainWrapper = document.querySelector('.wiki-wrapper');
            if (reachNav.classList.contains('open')) {
                mainWrapper.style.transition = 'var(--transition)';
                mainWrapper.style.transform = 'translateY(25vh)';
            } else {
                mainWrapper.style.transform = 'translateY(0)';
            }
        });
    }

    // Обработка кликов по ссылкам в мобильном Reachability меню
    document.querySelectorAll('.reachability-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle) menuToggle.classList.remove('active');
            if (reachNav) reachNav.classList.remove('open');
            document.querySelector('.wiki-wrapper').style.transform = 'translateY(0)';
        });
    });

   // Замените блок определения текущего пути при старте:
   let currentPath = window.location.pathname;
   
   // Если зашли через kaeront.ru/wiki/, убираем этот префикс для корректного поиска статьи
   if (currentPath.startsWith('/wiki')) {
       currentPath = currentPath.replace(/^\/wiki/, '');
   }

   let currentPath = window.location.pathname.substring(1); 

    // Если зашли на главную поддомена, открываем базовый гайд
    if (!currentPath || currentPath === "" || currentPath === "index.html") {
        currentPath = "survival/overview"; 
    }
    
    loadArticle(currentPath);
});

// Слушаем кнопки "Назад / Вперед" в браузере для полноценного SPA опыта
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.path) {
        loadArticle(e.state.path);
    }
});
