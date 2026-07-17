/* ARCHIVE.KAERONT.RU GLOBAL CORE & SMART HYBRID ROUTER */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

marked.setOptions({ breaks: true, gfm: true });

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

// Улучшенная функция получения маршрута
function getCleanRoute() {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam) return pageParam;

    const path = window.location.pathname.replace(/^\/archive/, '').replace(/^\//, '');
    return (path === '' || path === 'index') ? 'index' : path;
}

/* --- КОНФИГУРАЦИЯ СТАТУСОВ --- */
const STATUS_BANNERS = {
    'dev': `<div class="status-banner dev"><h3>В разработке</h3><p>Идёт активное создание контента.</p></div>`,
    'no-images': `<div class="status-banner no-images"><h3>Планируются иллюстрации</h3><p>Страница содержит только текст.</p></div>`,
    'not-ready': `<div class="status-banner not-ready"><h3>Статья не готова</h3><p>Контент на ранней стадии.</p></div>`,
    'outdated': `<div class="status-banner outdated"><h3>Статья могла устареть</h3><p>Требует сверки.</p></div>`
};

async function loadArticle() {
    const routeName = getCleanRoute();

    // 1. Умный пуш URL: если есть ?page=, меняем адрес на чистый путь
    if (window.location.search.includes('page=')) {
        window.history.replaceState(null, null, `/archive/${routeName}`);
    }

    if (routeName === 'search') {
        renderSearchPage();
        return;
    }

    try {
        const response = await fetch(`/archive/${routeName}.md`);
        if (!response.ok) throw new Error('404');
        let markdownText = await response.text();
        
        const statusMatch = markdownText.match(/<!--\s*status:\s*(.*?)\s*-->/);
        let bannersHtml = '';
        if (statusMatch && statusMatch[1]) {
            statusMatch[1].split(',').forEach(s => { if(STATUS_BANNERS[s.trim()]) bannersHtml += STATUS_BANNERS[s.trim()]; });
            markdownText = markdownText.replace(statusMatch[0], '');
        }
        contentContainer.innerHTML = bannersHtml + marked.parse(markdownText);
    } catch (e) {
        contentContainer.innerHTML = `<h1>Статья не найдена</h1><p>Документ <code>${routeName}.md</code> не существует.</p>`;
    }
}

// ==========================================
// Логика поиска и сайдбара
// ==========================================
function initSearch() {
    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) return;

    let phantomLink = document.querySelector('.phantom-search-link') || document.createElement('a');
    phantomLink.className = 'phantom-search-link';
    phantomLink.style.cssText = 'display:none; padding:10px; color:var(--accent); cursor:pointer; font-size:0.7rem;';
    if (!phantomLink.parentNode) searchInput.parentNode.insertBefore(phantomLink, searchInput.nextSibling);

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const links = document.querySelectorAll('.wiki-tree a:not(.phantom-search-link)');
        const folders = document.querySelectorAll('.wiki-tree .wiki-folder');

        phantomLink.style.display = query ? 'block' : 'none';
        phantomLink.textContent = `Все результаты для «${query}»`;
        phantomLink.onclick = () => performTransition('/archive/search?q=' + encodeURIComponent(query));

        links.forEach(link => {
            const isMatch = link.textContent.toLowerCase().includes(query);
            link.style.display = (query === '' || isMatch) ? '' : 'none';
            if (query && isMatch) {
                const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                link.innerHTML = link.textContent.replace(regex, '<span class="sidebar-match">$1</span>');
            } else {
                link.innerHTML = link.textContent;
            }
        });

        folders.forEach(f => {
            const hasVisible = Array.from(f.querySelectorAll('a')).some(a => a.style.display !== 'none');
            f.style.display = (query === '' || hasVisible) ? '' : 'none';
            if (query !== '' && hasVisible) f.classList.add('open');
            else if (query === '') f.classList.remove('open');
        });
    });
}

async function performTransition(targetUrl) {
    appContainer.classList.add('scale-down');
    await new Promise(r => setTimeout(r, 150));
    window.history.pushState(null, null, targetUrl);
    await loadArticle();
    updateActiveSidebarLink();
    window.scrollTo(0, 0);
    appContainer.classList.remove('scale-down');
}

function updateActiveSidebarLink() {
    const current = getCleanRoute();
    document.querySelectorAll('.wiki-tree a').forEach(link => {
        const href = link.getAttribute('href') || '';
        const match = href.includes(current) && current !== 'index';
        link.classList.toggle('active', match);
        if (match) {
            let p = link.closest('.wiki-folder');
            while(p) { p.classList.add('open'); p = p.parentElement.closest('.wiki-folder'); }
        }
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', async () => {
    initSearch();
    await loadArticle();
    updateActiveSidebarLink();
    const loader = document.getElementById('loader-wrapper');
    if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.visibility = 'hidden', 300); }
    appContainer.classList.remove('scale-down');
});
