/* ARCHIVE.KAERONT.RU GLOBAL CORE & SMART HYBRID ROUTER */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

// Кастомный рендерер Marked с поддержкой подсвечиваемых блоков кода через Prism.js
const renderer = new marked.Renderer();
renderer.code = function(code, language) {
    const validLang = language && Prism.languages[language] ? language : 'markup';
    const highlighted = language && Prism.languages[language] 
        ? Prism.highlight(code, Prism.languages[language], language)
        : escapeHtml(code);

    return `
        <div class="code-block-wrapper">
            <div class="code-block-header">
                <span>${language ? language.toUpperCase() : 'TEXT'}</span>
                <button class="code-copy-btn" onclick="copyCodeSnippet(this)">Копировать</button>
            </div>
            <pre class="language-${validLang}"><code class="language-${validLang}">${highlighted}</code></pre>
        </div>
    `;
};

// Настраиваем парсер Marked с подключением кастомного рендерера
marked.setOptions({
    renderer: renderer,
    breaks: true,
    gfm: true
});

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

// Получаем чистый путь статьи с поддержкой редирект-параметров
function getCleanRoute() {
    if (isLocal) {
        const hash = window.location.hash;
        const cleanHash = hash.replace('#/archive/', '').replace('#/', '').replace('#', '');
        return (cleanHash === '' || cleanHash === 'index' || cleanHash === 'archive') ? 'index' : cleanHash;
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        
        if (pageParam) {
            return pageParam;
        }

        const path = window.location.pathname;
        let relativePath = path.replace(/^\/archive/, '');
        relativePath = relativePath.replace(/^\//, '');
        
        return (relativePath === '' || relativePath === 'index') ? 'index' : relativePath;
    }
}

/* --- КОНФИГУРАЦИЯ СТАТУСОВ СТРАНИЦ --- */
const STATUS_BANNERS = {
    'dev': `
        <div class="status-banner dev">
            <h3>В разработке</h3>
            <p>Идёт активное создание упомянутого внутриигрового контента. Возможны кардинальные изменения статьи.</p>
        </div>`,
    'no-images': `
        <div class="status-banner no-images">
            <h3>Планируются иллюстрации</h3>
            <p>Статья содержит только текст. Иллюстрации и прочие изображения будут добавлены в ближайшее время.</p>
        </div>`,
    'not-ready': `
        <div class="status-banner not-ready">
            <h3>Статья не готова</h3>
            <p>Статья на ранней стадии написания. Возможны неточности или пустые разделы и ссылки.</p>
        </div>`,
    'outdated': `
        <div class="status-banner outdated">
            <h3>Старая статья</h3>
            <p>Статья восстановлена по старым архивам или памяти. Команде Kaeront-архива требуется сверка с актуальной версией проекта.</p>
        </div>`,
    'final': `
        <div class="status-banner final">
            <h3>Статья завершена</h3>
            <p>Эта статья больше не будет обновляться. Возможны лишь небольшие исправления и корректировки текста и ссылок.</p>
        </div>`,
    'unofficial-verified': `
        <div class="status-banner unofficial-verified">
            <h3>Подтверждено</h3>
            <p>Некоторые элементы этой статьи, собранные сообществом, подтверждены командой Kaeront и носят официальный характер.</p>
        </div>`,
    'unofficial-unverified': `
        <div class="status-banner unofficial-unverified">
            <h3>Неофициальный контент</h3>
            <p>Некоторые элементы этой статьи собраны сообществом и еще не перепроверены командой Kaeront. Статья носит ознакомительный характер.</p>
        </div>`,
    'guide': `
        <div class="status-banner guide">
            <h3>Это — руководство</h3>
            <p>Практический материал с советами. Он поможет разобраться в механиках и избежать частых ошибок.</p>
        </div>`
};

// Загрузка Markdown-файла
async function loadArticle() {
    const routeName = getCleanRoute();
    
    // Сбрасываем сырой режим при переходе
    isRawCodeActive = false;
    contentContainer.classList.remove('raw-code-mode');

    // ФАНТОМНАЯ СТРАНИЦА ПОИСКА
    if (routeName === 'search') {
        renderSearchPage();
        return;
    }

    const filePath = `/archive/${routeName}.md`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Статья отсутствует');
        let markdownText = await response.text();
        currentRawMarkdown = markdownText;

        // Ищем строку статуса
        const statusMatch = markdownText.match(/<!--\s*status:\s*(.*?)\s*-->/);
        let bannersHtml = '';

        if (statusMatch && statusMatch[1]) {
            const statusString = statusMatch[1];
            const statusList = statusString.split(',').map(s => s.trim());

            statusList.forEach(id => {
                if (STATUS_BANNERS[id]) {
                    bannersHtml += STATUS_BANNERS[id];
                }
            });

            // Оборачиваем в контейнер всегда, если есть хотя бы один баннер
            if (bannersHtml !== '') {
                bannersHtml = `<div class="status-banners-container">${bannersHtml}</div>`;
            }

            markdownText = markdownText.replace(statusMatch[0], '');
        }

        contentContainer.innerHTML = bannersHtml + marked.parse(markdownText);

        // Динамическая переподсветка синтаксиса
        if (window.Prism) {
            Prism.highlightAllUnder(contentContainer);
        }

    } catch (error) {
        currentRawMarkdown = '';
        contentContainer.innerHTML = `
            <h1>Статья не найдена</h1>
            <p>Документ <code>${routeName}.md</code> ещё не создан или находится в разработке.<br><h3>Советуем:</h3><ul><li>Поискать в <a href="/archive/search">расширенном поиске</a></li><li>Обновить страницу</li><li>Проверить подключение к интернету</li><li>Обратиться в <a href="/archive/contacts">контакты поддержки</a>, если проблема сохраняется</li></ul></p>
        `;
    }
}

// Функция копирования кода из блока
function copyCodeSnippet(btn) {
    const wrapper = btn.closest('.code-block-wrapper');
    const code = wrapper ? wrapper.querySelector('code').innerText : '';
    
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            const orig = btn.textContent;
            btn.textContent = 'Скопировано!';
            btn.style.background = 'var(--accent)';
            btn.style.color = '#000';
            setTimeout(() => {
                btn.textContent = orig;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });
    }
}

// ==========================================
// 1. Внедрение стилей с высокой специфичностью
// ==========================================
const style = document.createElement('style');
style.textContent = `
    /* Подсветка в карточках результатов поиска */
    mark.search-match {
        font-weight: bold !important;
        color: #fa0 !important;
        background: rgba(255, 153, 0, 0.2) !important;
        padding: 0 4px !important;
        border-radius: 3px !important;
        border: 1px solid rgba(255, 153, 0, 0.4) !important;
    }
    
    /* Стили для поля ввода */
    .search-input-field {
        width: 100%;
        box-sizing: border-box; 
        padding: 12px;
        background: #0d0d0d;
        border: 1px solid #222;
        color: #fff;
        margin-bottom: 25px;
        font-family: inherit;
        border-radius: 10px;
        transition: border-color 0.2s ease;
    }
    .search-input-field:focus {
        border-color: #fa0;
        box-shadow: 0 0 10px rgba(255, 170, 0, 0.25);
        outline: none;
    }

    /* Карточки результатов */
    .search-result-card {
        border: 1px solid #202020;
        background: #0d0d0d;
        padding: 20px;
        margin-bottom: 10px;
        cursor: pointer;
        border-radius: 10px;
        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    }
    .search-result-card:hover {
        border-color: var(--accent);
        box-shadow: 0 0 24px rgba(255, 170, 0, 0.25);
        transform: translateY(-5px);
    }
    .search-result-card h3 {
        margin: 0 !important;
        font-size: 1.2rem !important;
    }
    .search-result-card p {
        margin: 0 !important;
        color: #888;
        font-size: 0.8rem !important;
        line-height: 1.5;
    }

    /* Подсветка совпадений в сайдбаре */
    .sidebar-match {
        font-weight: bold !important;
        color: #fa0 !important;
        background: rgba(255, 153, 0, 0.1) !important;
        padding: 1px 3px !important;
        border-radius: 2px !important;
    }

    .search-hidden { display: none !important; }
`;
document.head.appendChild(style);

// Безопасное экранирование спецсимволов RegExp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Безопасная подсветка текста (Защита от инъекций в HTML)
function highlightText(text, query, className) {
    if (!query) return text;
    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    // Разбиваем текст по совпадениям и экранируем обычный текст, 
    // оборачивая только совпавшие куски в теги подсветки
    return text.split(regex).map((part, i) => {
        if (i % 2 === 1) {
            return `<mark class="${className}">${escapeHtml(part)}</mark>`;
        }
        return escapeHtml(part);
    }).join('');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// ==========================================
// 2. Логика страницы глобального поиска
// ==========================================
async function renderSearchPage() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    
    contentContainer.innerHTML = `
        <h1>Расширенный поиск по архиву</h1>
        <p style="font-size: 0.85em !important;">Расширенный поиск позволяет искать по полному тексту всех доступных материалов. Система анализирует содержимое всех файлов, предоставляя контекстные сниппеты с выделением найденных совпадений.</p>
        <input type="text" class="search-input-field" value="${escapeHtml(query)}" placeholder="Что вы хотите найти?">
        <div id="results-list"></div>
    `;

    const input = contentContainer.querySelector('.search-input-field');
    input.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') {
            performTransition('/archive/search?q=' + encodeURIComponent(input.value.trim())); 
        } 
    });

    if (!query.trim()) return;
    const list = document.getElementById('results-list');
    list.innerHTML = '<p>Ищем совпадения по базам данных...</p>';

    const links = Array.from(document.querySelectorAll('.wiki-tree a'));
    const results = [];
    const lowerQuery = query.toLowerCase().trim();

    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href || href.includes('search')) continue; // Пропускаем саму страницу поиска

        try {
            const res = await fetch(`${href}.md`);
            
            // Защита от 404/500 ошибок (когда сервер возвращает HTML вместо MD)
            if (!res.ok) {
                console.warn(`Не удалось загрузить ресурс ${href}.md (Статус: ${res.status})`);
                continue; 
            }

            const rawText = await res.text();
            
            // Компилируем Markdown в HTML, затем извлекаем исключительно текстовую ноду
            const html = marked.parse(rawText);
            const doc = new DOMParser().parseFromString(html, 'text/html');
            
            // Удаляем стили и скрипты, если они случайно просочились
            const scripts = doc.querySelectorAll('script, style');
            scripts.forEach(s => s.remove());

            const cleanText = doc.body.textContent || "";
            const cleanTextLower = cleanText.toLowerCase();

            if (cleanTextLower.includes(lowerQuery)) {
                const idx = cleanTextLower.indexOf(lowerQuery);
                
                // Динамическое формирование контекстных границ сниппета
                const start = Math.max(0, idx - 60);
                const end = Math.min(cleanText.length, idx + lowerQuery.length + 80);
                
                let snippet = cleanText.substring(start, end);
                
                // Красивое оформление границ текста
                if (start > 0) snippet = '...' + snippet;
                if (end < cleanText.length) snippet = snippet + '...';
                
                // Очищаем сниппет от лишних переносов строк для компактности
                snippet = snippet.replace(/\s+/g, ' ');

                results.push({ 
                    title: link.textContent.trim(), 
                    href: href, 
                    snippet: snippet 
                });
            }
        } catch (e) {
            console.error(`Ошибка обработки файла ${href}:`, e);
        }
    }

    if (results.length === 0) {
        list.innerHTML = '<p>Ничего не найдено. Попробуйте изменить запрос.</p>';
    } else {
        list.innerHTML = results.map(r => `
            <div class="search-result-card" onclick="performTransition('${r.href}')">
                <h3>${escapeHtml(r.title)}</h3>
                <p>${highlightText(r.snippet, query, 'search-match')}</p>
            </div>
        `).join('');
    }
}

// ==========================================
// 3. Быстрый поиск и подсветка в сайдбаре
// ==========================================
function initSearch() {
    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) return;

    // Фантомная ссылка для быстрого перехода
    let phantomLink = document.querySelector('.phantom-search-link');
    if (!phantomLink) {
        phantomLink = document.createElement('a');
        phantomLink.className = 'phantom-search-link';
        phantomLink.style.cssText = 'display:none; padding:10px; color:var(--accent); cursor:pointer; font-size:0.7rem;';
        searchInput.parentNode.insertBefore(phantomLink, searchInput.nextSibling);
    }

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const links = document.querySelectorAll('.wiki-tree a');
        const folders = document.querySelectorAll('.wiki-tree .wiki-folder');

        // Управление фантомной ссылкой
        if (query.length > 0) {
            phantomLink.textContent = `Все результаты для «${query}»`;
            phantomLink.style.display = 'block';
            phantomLink.onclick = () => { 
                performTransition('/archive/search?q=' + encodeURIComponent(query)); 
            };
        } else {
            phantomLink.style.display = 'none';
        }

        // Фильтрация ссылок
        links.forEach(link => {
            const text = link.textContent.toLowerCase();
            if (query === '' || text.includes(query)) {
                link.classList.remove('search-hidden');
                const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                link.innerHTML = query !== '' ? link.textContent.replace(regex, '<span class="sidebar-match">$1</span>') : link.textContent;
            } else {
                link.classList.add('search-hidden');
            }
        });

        // Авто-свертывание и скрытие пустых папок
        folders.forEach(f => {
            const hasVisibleLinks = f.querySelector('a:not(.search-hidden)');
            
            if (query !== '') {
                f.classList.toggle('search-hidden', !hasVisibleLinks);
                if (hasVisibleLinks) f.classList.add('open');
            } else {
                f.classList.remove('search-hidden');
                f.classList.remove('open');
            }
        });
    });
}

// Быстрый асинхронный переход
async function performTransition(targetUrl) {
    appContainer.classList.add('scale-down');
    await new Promise(resolve => setTimeout(resolve, 150));

    if (isLocal) {
        window.location.hash = targetUrl.startsWith('/') ? '#' + targetUrl : targetUrl;
    } else {
        const cleanUrl = (targetUrl === '/archive/index' || targetUrl === '/archive') ? '/archive' : targetUrl;
        window.history.pushState(null, null, cleanUrl);
    }
    
    await loadArticle(); 
    updateActiveSidebarLink();
    
    window.scrollTo(0, 0);
    appContainer.classList.remove('scale-down');
}

// Подсветка текущей страницы
function updateActiveSidebarLink() {
    const currentRoute = getCleanRoute();
    const links = document.querySelectorAll('.wiki-tree a');
    
    links.forEach(link => {
        let linkRoute = link.getAttribute('href')
            .replace('/archive', '')
            .replace('#', '')
            .replace(/^\//, '') || 'index';
            
        if (linkRoute === currentRoute) {
            link.classList.add('active');
            let parentFolder = link.closest('.wiki-folder');
            while (parentFolder) {
                parentFolder.classList.add('open');
                parentFolder = parentFolder.parentElement.closest('.wiki-folder');
            }
        } else {
            link.classList.remove('active');
        }
    });
}

// Универсальный перехват кликов
document.body.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link) {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('/archive') || href.startsWith('#'))) {
            e.preventDefault();
            performTransition(href);
        }
    }
});

window.addEventListener(isLocal ? 'hashchange' : 'popstate', async () => {
    appContainer.classList.add('scale-down');
    await new Promise(resolve => setTimeout(resolve, 150));
    await loadArticle();
    updateActiveSidebarLink();
    appContainer.classList.remove('scale-down');
});

document.addEventListener('DOMContentLoaded', async () => {
    appContainer.classList.add('scale-down');

    // Обработка редиректа ?page= БЕЗ удаления других параметров
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    
    if (page) {
        // Создаем новые параметры, исключая page, чтобы сохранить остальные (например q)
        urlParams.delete('page');
        const remainingParams = urlParams.toString();
        const newUrl = `/archive/${page}` + (remainingParams ? `?${remainingParams}` : '');
        window.history.replaceState(null, null, newUrl);
    }

    // Инициализация поиска ДО загрузки статьи
    initSearch();

    // Загрузка контента
    await loadArticle();
    updateActiveSidebarLink();

    // 4Восстановление строки поиска, если мы на странице поиска
    const query = new URLSearchParams(window.location.search).get('q');
    const mainInput = document.querySelector('.search-input-field');
    if (mainInput && query) {
        mainInput.value = query;
    }

    setTimeout(() => appContainer.classList.remove('scale-down'), 100);
});

/* ==========================================
   4. Плавающая кнопка действия с архивом
   ========================================== */

// Хранение исходного Markdown текущей страницы для переключения режима "Показать код"
let currentRawMarkdown = "";
let isRawCodeActive = false;

// Внедрение виджета в DOM при загрузке
function initArchiveActionsWidget() {
    if (document.getElementById('archive-actions-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'archive-actions-widget';
    widget.className = 'archive-actions-widget';
    widget.innerHTML = `
        <button class="archive-fab-btn" id="archive-fab-toggle" title="Действия со страницей">
            <svg viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
        </button>
        <div class="archive-actions-menu">
            <button class="archive-actions-item" id="action-show-raw">
                📄 Показать сырым
            </button>
            <button class="archive-actions-item" id="action-toggle-code">
                💻 Показать код
            </button>
            <button class="archive-actions-item" id="action-open-github">
                🐙 Показать в GitHub
            </button>
        </div>
    `;

    document.body.appendChild(widget);

    const toggleBtn = document.getElementById('archive-fab-toggle');
    const rawBtn = document.getElementById('action-show-raw');
    const codeBtn = document.getElementById('action-toggle-code');
    const githubBtn = document.getElementById('action-open-github');

    // Открытие / закрытие выпадающего меню
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        widget.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        widget.classList.remove('open');
    });

    // 1. Показать сырым (.md в конце адреса в новой вкладке)
    rawBtn.addEventListener('click', () => {
        const route = getCleanRoute();
        if (route === 'search') return;
        const rawUrl = `${window.location.origin}/archive/${route}.md`;
        window.open(rawUrl, '_blank');
    });

    // 2. Показать код (Переключение стилей и отображения Markdown)
    codeBtn.addEventListener('click', () => {
        isRawCodeActive = !isRawCodeActive;
        applyCodeViewMode(isRawCodeActive);
    });

    // 3. Показать в GitHub
    githubBtn.addEventListener('click', () => {
        const route = getCleanRoute();
        if (route === 'search') return;
        const githubUrl = `https://github.com/Kaeront/Kaeront/blob/main/archive/${route}.md`;
        window.open(githubUrl, '_blank');
    });
}

// Применение или отмена режима "Показать код"
function applyCodeViewMode(active) {
    if (active) {
        contentContainer.classList.add('raw-code-mode');
        contentContainer.textContent = currentRawMarkdown;
    } else {
        contentContainer.classList.remove('raw-code-mode');
        // Повторная загрузка и рендеринг статьи
        loadArticle();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initArchiveActionsWidget();
});
