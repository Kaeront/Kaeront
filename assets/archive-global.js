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

// CSS для подсветки
const style = document.createElement('style');
style.textContent = `
    .search-match { font-weight: bold; color: var(--accent); background: rgba(255,165,0,0.3); padding: 0 2px; }
    .search-input-field { width: 100%; padding: 12px; background: #000; border: 1px solid #444; color: #fff; margin-bottom: 20px; }
    .search-result-card { border: 1px solid #333; padding: 15px; margin-bottom: 15px; cursor: pointer; }
    .sidebar-match { font-weight: bold; color: var(--accent); }
`;
document.head.appendChild(style);

async function renderSearchPage() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    
    contentContainer.innerHTML = `<h1>Поиск</h1><input type="text" class="search-input-field" value="${query}" placeholder="Введите запрос...">
    <div id="results-list"></div>`;

    const input = contentContainer.querySelector('.search-input-field');
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') performTransition('/archive/search?q=' + encodeURIComponent(input.value)); });

    if (!query) return;
    const list = document.getElementById('results-list');
    list.innerHTML = '<p>Загрузка результатов...</p>';

    const links = Array.from(document.querySelectorAll('.wiki-tree a'));
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const link of links) {
        try {
            const res = await fetch(`${link.getAttribute('href')}.md`);
            const text = await res.text();
            
            // Парсинг: превращаем MD в HTML и очищаем через DOMParser (игнорирует теги)
            const html = marked.parse(text);
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const cleanText = doc.body.textContent || "";
            
            if (cleanText.toLowerCase().includes(lowerQuery)) {
                // Создание сниппета с нормальным троеточием
                const idx = cleanText.toLowerCase().indexOf(lowerQuery);
                const start = Math.max(0, idx - 40);
                const end = Math.min(cleanText.length, idx + 60);
                let snippet = cleanText.substring(start, end);
                if (start > 0) snippet = '...' + snippet;
                if (end < cleanText.length) snippet = snippet + '...';
                
                results.push({ title: link.textContent, href: link.getAttribute('href'), snippet });
            }
        } catch (e) {}
    }

    if (results.length === 0) {
        list.innerHTML = '<p>Результатов не найдено.</p>';
    } else {
        list.innerHTML = results.map(r => `
            <div class="search-result-card" onclick="performTransition('${r.href}')">
                <h3>${r.title}</h3>
                <p>${r.snippet.replace(new RegExp(query, 'gi'), '<mark class="search-match">$&</mark>')}</p>
            </div>
        `).join('');
    }
}

// Улучшенный поиск в сайдбаре
function initSearch() {
    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const links = document.querySelectorAll('.wiki-tree a');
        
        links.forEach(link => {
            const text = link.textContent;
            if (query && text.toLowerCase().includes(query)) {
                link.innerHTML = text.replace(new RegExp(query, 'gi'), '<span class="sidebar-match">$&</span>');
            } else {
                link.innerHTML = text;
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

// Логика живого поиска по сайдбару
function initSearch() {
    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) return;

    // Фантомная ссылка "Все результаты"
    const phantomLink = document.createElement('a');
    phantomLink.style.display = 'none';
    phantomLink.style.padding = '10px';
    phantomLink.style.color = 'var(--accent)';
    phantomLink.style.cursor = 'pointer';
    searchInput.parentNode.insertBefore(phantomLink, searchInput.nextSibling);

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length > 0) {
            phantomLink.textContent = `Все результаты для «${query}»`;
            phantomLink.style.display = 'block';
            phantomLink.onclick = () => {
                searchInput.value = '';
                phantomLink.style.display = 'none';
                performTransition('/archive/search?q=' + encodeURIComponent(query));
            };
        } else {
            phantomLink.style.display = 'none';
        }

        const links = document.querySelectorAll('.wiki-tree a');
        const folders = document.querySelectorAll('.wiki-tree .wiki-folder');

        if (query === '') {
            links.forEach(l => { l.classList.remove('search-hidden'); l.innerHTML = l.textContent; });
            folders.forEach(f => { f.classList.remove('search-hidden'); f.classList.remove('open'); });
            updateActiveSidebarLink();
            return;
        }

        links.forEach(link => {
            const text = link.textContent;
            if (text.toLowerCase().includes(query)) {
                link.classList.remove('search-hidden');
            } else {
                link.classList.add('search-hidden');
            }
        });

        folders.forEach(folder => {
            const hasVisibleLinks = folder.querySelectorAll('a:not(.search-hidden)').length > 0;
            if (hasVisibleLinks) {
                folder.classList.remove('search-hidden');
                folder.classList.add('open');
            } else {
                folder.classList.add('search-hidden');
                folder.classList.remove('open');
            }
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
    if (!isLocal) {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');

        if (pageParam) {
            window.history.replaceState(null, null, `/archive/${pageParam}`);
        } else if (window.location.pathname === '/archive/index') {
            window.history.replaceState(null, null, '/archive');
        }
    }

    appContainer.classList.add('scale-down');
    await loadArticle();
    updateActiveSidebarLink();
    initSearch();
    
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }
    
    setTimeout(() => {
        appContainer.classList.remove('scale-down');
    }, 100);
});
