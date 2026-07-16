/* ARCHIVE.KAERONT.RU GLOBAL CORE & SMART HYBRID ROUTER */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

// Настраиваем парсер Marked
marked.setOptions({
    breaks: true,
    gfm: true
});

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

// Получаем чистый путь статьи с поддержкой редирект-параметров
function getCleanRoute() {
    const path = window.location.pathname;
    
    // Исключаем корень, возвращая индекс
    if (path === '/archive' || path === '/archive/') return 'index';
    
    // Получаем путь после /archive/
    let route = path.replace(/^\/archive\//, '');
    
    // Очищаем от возможных параметров запроса, если они попали в строку
    return route.split('?')[0] || 'index';
}

/* --- КОНФИГУРАЦИЯ СТАТУСОВ СТРАНИЦ --- */
const STATUS_BANNERS = {
    'dev': `
        <div class="status-banner dev">
            <h3>В разработке</h3>
            <p>Идёт активное создание контента. Возможны изменения структуры.</p>
        </div>`,
    'no-images': `
        <div class="status-banner no-images">
            <h3>Планируются иллюстрации</h3>
            <p>Страница содержит только текст. Иллюстрации и прочие изображения будут добавлены в ближайшее время.</p>
        </div>`,
    'not-ready': `
        <div class="status-banner not-ready">
            <h3>Статья не готова</h3>
            <p>Контент на ранней стадии написания. Возможны неточности или пустые разделы.</p>
        </div>`,
    'outdated': `
        <div class="status-banner outdated">
            <h3>Статья могла устареть</h3>
            <p>Статья восстановлена по старым архивам или памяти. Требует сверки с актуальной версией проекта.</p>
        </div>`
};

// Загрузка Markdown-файла
async function loadArticle() {
    const routeName = getCleanRoute();
    
    // Если путь совпадает с поиском или в URL есть параметры поиска, вызываем рендер
    if (routeName === 'search' || window.location.pathname.includes('/search')) {
        renderSearchPage();
        return;
    }

    const filePath = `/archive/${routeName}.md`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Статья отсутствует');
        let markdownText = await response.text();

        // 1. Ищем строку статуса
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

            markdownText = markdownText.replace(statusMatch[0], '');
        }

        contentContainer.innerHTML = bannersHtml + marked.parse(markdownText);

    } catch (error) {
        contentContainer.innerHTML = `
            <h1>Статья не найдена</h1>
            <p>Документ <code>${routeName}.md</code> ещё не создан или находится в разработке.<br><h3>Советуем:</h2><ul><li>Обновить страницу</li><li>Проверить подключение к интернету</li><li>Обратиться в <a href="/archive/contacts">контакты поддержки</a>, если проблема сохраняется</li></ul></p>
        `;
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
        color: #ff9900 !important; /* Ваш акцентный цвет Kaeront */
        background: rgba(255, 153, 0, 0.2) !important;
        padding: 0 4px !important;
        border-radius: 3px !important;
        border: 1px solid rgba(255, 153, 0, 0.4) !important;
    }
    
    /* Стили для поля ввода */
    .search-input-field {
        width: 100%;
        padding: 12px;
        background: #0d0d0d;
        border: 1px solid #222;
        color: #fff;
        margin-bottom: 25px;
        font-family: inherit;
        border-radius: 4px;
        transition: border-color 0.2s ease;
    }
    .search-input-field:focus {
        border-color: #ff9900;
        outline: none;
    }

    /* Карточки результатов */
    .search-result-card {
        border: 1px solid #1a1a1a;
        background: #050505;
        padding: 20px;
        margin-bottom: 15px;
        cursor: pointer;
        border-radius: 4px;
        transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .search-result-card:hover {
        border-color: #333;
        transform: translateY(-2px);
    }
    .search-result-card h3 {
        margin: 0 0 10px 0;
        color: #ff9900;
        font-size: 1.2rem;
    }
    .search-result-card p {
        margin: 0;
        color: #888;
        font-size: 0.95rem;
        line-height: 1.5;
    }

    /* Подсветка совпадений в сайдбаре */
    .sidebar-match {
        font-weight: bold !important;
        color: #ff9900 !important; /* Яркий акцентный цвет */
        text-shadow: 0 0 8px rgba(255, 153, 0, 0.4) !important;
        background: rgba(255, 153, 0, 0.1) !important;
        padding: 1px 3px !important;
        border-radius: 2px !important;
    }
`;
document.head.appendChild(style);

// ==========================================
// Helper: Безопасное экранирование спецсимволов RegExp
// ==========================================
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==========================================
// Helper: Безопасная подсветка текста (Защита от инъекций в HTML)
// ==========================================
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
        <h1>Поиск по архиву</h1>
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
    list.innerHTML = '<p style="color: #666;">Поиск совпадений по базам данных...</p>';

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
        list.innerHTML = '<p style="color: #888; margin-top: 20px;">Ничего не найдено. Попробуйте изменить запрос.</p>';
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

    // Ссылку "Все результаты"
    let phantomLink = document.querySelector('.phantom-search-link') || document.createElement('a');
    phantomLink.className = 'phantom-search-link';
    phantomLink.style.cssText = 'display:none; padding:10px; color:var(--accent); cursor:pointer; font-size:0.7rem;';
    if (!phantomLink.parentNode) searchInput.parentNode.insertBefore(phantomLink, searchInput.nextSibling);

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const links = document.querySelectorAll('.wiki-tree a:not(.phantom-search-link)');
        const folders = document.querySelectorAll('.wiki-tree .wiki-folder');

        phantomLink.style.display = query.length > 0 ? 'block' : 'none';
        phantomLink.textContent = `Все результаты для «${query}»`;
        phantomLink.onclick = () => performTransition('/archive/search?q=' + encodeURIComponent(query));

        links.forEach(link => {
            const isMatch = link.textContent.toLowerCase().includes(query);
            link.style.display = isMatch ? '' : 'none';
        });

        folders.forEach(f => {
            const hasVisible = Array.from(f.querySelectorAll('a')).some(a => a.style.display !== 'none');
            f.style.display = (query === '' || hasVisible) ? '' : 'none';
            // Если запрос есть и в папке есть что показать — разворачиваем её
            if (query !== '' && hasVisible) f.classList.add('open');
            else if (query === '') f.classList.remove('open');
        });
    });
}

// Быстрый асинхронный переход
async function performTransition(targetUrl) {
    appContainer.classList.add('scale-down');
    
    // Обновляем адресную строку
    window.history.pushState(null, null, targetUrl);
    
    // Загружаем контент
    await loadArticle();
    updateActiveSidebarLink();
    
    // Если перешли на поиск, восстанавливаем значение в поле
    if (targetUrl.includes('/archive/search')) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        const mainInput = document.querySelector('.search-input-field');
        if (mainInput) mainInput.value = q || '';
    }
    
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

// Логика живого поиска по сайдбару
function initSearch() {
    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) return;

    // Ссылку "Все результаты" вынесем в глобальную область, чтобы не дублировать
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

        if (query.length > 0) {
            phantomLink.textContent = `Все результаты для «${query}»`;
            phantomLink.style.display = 'block';
            phantomLink.onclick = () => { performTransition('/archive/search?q=' + encodeURIComponent(query)); };
        } else {
            phantomLink.style.display = 'none';
        }

        links.forEach(link => {
            const text = link.textContent;
            // Используем textContent для проверки, чтобы не искать внутри тегов <span>
            if (query && text.toLowerCase().includes(query)) {
                link.classList.remove('search-hidden');
                const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                link.innerHTML = text.replace(regex, '<span class="sidebar-match">$1</span>');
            } else {
                link.classList.remove('search-hidden');
                link.innerHTML = text; // Очистка
            }
        });

        // Скрытие пустых папок
        folders.forEach(f => {
            const hasVisible = f.querySelectorAll('a:not(.search-hidden)').length > 0;
            f.style.display = (hasVisible || query === '') ? '' : 'none';
            if (query !== '' && hasVisible) f.classList.add('open');
        });
    });
}

// УНИВЕРСАЛЬНЫЙ ПЕРЕХВАТ КЛИКОВ
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
    
    // Инициализируем поиск до загрузки контента
    initSearch();
    
    // ГЛАВНОЕ: Загружаем статью, основываясь на текущем URL
    await loadArticle();
    updateActiveSidebarLink();
    
    // Восстанавливаем запрос в поиске, если мы на странице поиска
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname.includes('/archive/search') && params.has('q')) {
        const mainInput = document.querySelector('.search-input-field');
        if (mainInput) mainInput.value = params.get('q');
    }
    
    // Убираем лоадер
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.visibility = 'hidden', 300);
    }
    
    setTimeout(() => appContainer.classList.remove('scale-down'), 100);
});
