/* ARCHIVE.KAERONT.RU GLOBAL CORE & SMART HYBRID ROUTER */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

marked.setOptions({ breaks: true, gfm: true });

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

// 1. ИСПРАВЛЕННЫЙ ПУТЬ: Теперь он корректно обрабатывает параметры
function getCleanRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) return pageParam;

    const path = window.location.pathname.replace(/^\/archive/, '').replace(/^\//, '');
    return (path === '' || path === 'index') ? 'index' : path;
}

// 2. АВТОМАТИЧЕСКИЙ ПУШ URL: Исправляет состояние после перезагрузки
function handleUrlSync() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page) {
        window.history.replaceState(null, '', `/archive/${page}`);
    }
}

const STATUS_BANNERS = {
    'dev': `<div class="status-banner dev"><h3>В разработке</h3><p>Идёт активное создание контента.</p></div>`,
    'no-images': `<div class="status-banner no-images"><h3>Планируются иллюстрации</h3><p>Страница содержит только текст.</p></div>`,
    'not-ready': `<div class="status-banner not-ready"><h3>Статья не готова</h3><p>Контент на ранней стадии.</p></div>`,
    'outdated': `<div class="status-banner outdated"><h3>Статья могла устареть</h3><p>Требует сверки.</p></div>`
};

async function loadArticle() {
    const routeName = getCleanRoute();
    if (routeName === 'search') {
        renderSearchPage();
        return;
    }

    const filePath = `/archive/${routeName}.md`;
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error();
        let markdownText = await response.text();
        const statusMatch = markdownText.match(/<!--\s*status:\s*(.*?)\s*-->/);
        let bannersHtml = '';
        if (statusMatch && statusMatch[1]) {
            statusMatch[1].split(',').forEach(id => { if (STATUS_BANNERS[id.trim()]) bannersHtml += STATUS_BANNERS[id.trim()]; });
            markdownText = markdownText.replace(statusMatch[0], '');
        }
        contentContainer.innerHTML = bannersHtml + marked.parse(markdownText);
    } catch (error) {
        contentContainer.innerHTML = `<h1>Статья не найдена</h1><p>Документ <code>${routeName}.md</code> отсутствует.</p>`;
    }
}

// --- ПОИСК И САЙДБАР ---

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

        phantomLink.style.display = query.length > 0 ? 'block' : 'none';
        phantomLink.textContent = `Все результаты для «${query}»`;
        phantomLink.onclick = () => performTransition('/archive/search?q=' + encodeURIComponent(query));

        links.forEach(link => {
            const isMatch = link.textContent.toLowerCase().includes(query);
            link.style.display = (query === '' || isMatch) ? '' : 'none';
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
    const currentRoute = getCleanRoute();
    document.querySelectorAll('.wiki-tree a').forEach(link => {
        const route = link.getAttribute('href')?.replace('/archive', '').replace('/', '') || 'index';
        link.classList.toggle('active', route === currentRoute);
        if (route === currentRoute) {
            let p = link.closest('.wiki-folder');
            while(p) { p.classList.add('open'); p = p.parentElement.closest('.wiki-folder'); }
        }
    });
}

// --- ПЕРЕХВАТЫ ---

document.body.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && (link.getAttribute('href')?.startsWith('/archive') || link.getAttribute('href')?.startsWith('#'))) {
        e.preventDefault();
        performTransition(link.getAttribute('href'));
    }
});

window.addEventListener('popstate', async () => {
    await loadArticle();
    updateActiveSidebarLink();
});

document.addEventListener('DOMContentLoaded', async () => {
    handleUrlSync(); // Исправляем URL сразу
    initSearch();
    await loadArticle();
    updateActiveSidebarLink();
    
    const loader = document.getElementById('loader-wrapper');
    if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.visibility = 'hidden', 300); }
});

// --- СТИЛИ ---
const style = document.createElement('style');
style.textContent = `
    .search-hidden { display: none !important; }
    .sidebar-match { font-weight: bold; color: #ff9900; background: rgba(255, 153, 0, 0.1); }
    .wiki-folder { transition: max-height 0.3s ease; }
`;
document.head.appendChild(style);
