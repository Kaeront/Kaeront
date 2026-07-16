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

// ЛОГИКА ПОИСКОВОЙ СИСТЕМЫ
async function renderSearchPage() {
    const query = new URLSearchParams(window.location.search).get('q') || '';
    contentContainer.innerHTML = `<h1>Результаты поиска для: «${query}»</h1><div id="search-results-container">Загрузка...</div>`;
    
    const links = Array.from(document.querySelectorAll('.wiki-tree a'));
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const link of links) {
        const href = link.getAttribute('href');
        try {
            const response = await fetch(`${href.replace('/archive', '/archive')}.md`);
            const text = await response.text();
            
            // Проверка на вхождение (с учетом вариаций слов)
            if (text.toLowerCase().includes(lowerQuery)) {
                const index = text.toLowerCase().indexOf(lowerQuery);
                const snippet = text.substring(Math.max(0, index - 50), Math.min(text.length, index + 100));
                results.push({ title: link.textContent, href, snippet });
            }
        } catch (e) {}
    }

    const container = document.getElementById('search-results-container');
    if (results.length === 0) {
        container.innerHTML = '<p>Ничего не найдено.</p>';
    } else {
        container.innerHTML = results.map(r => `
            <div class="search-card" style="border:1px solid #333; padding:20px; margin-bottom:15px; cursor:pointer;" onclick="performTransition('${r.href}')">
                <h3>${r.title}</h3>
                <p>...${r.snippet.replace(new RegExp(lowerQuery, 'gi'), '<b>$&</b>')}...</p>
            </div>
        `).join('');
    }
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
