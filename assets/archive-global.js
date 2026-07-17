/* ARCHIVE.KAERONT.RU GLOBAL CORE */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

// 1. ИСПРАВЛЕННЫЙ РОУТЕР
function getCleanRoute() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('page')) return params.get('page');
    const path = window.location.pathname.replace(/^\/archive\/?/, '');
    return (path === '' || path === 'index') ? 'index' : path;
}

// 2. СНИППЕТЫ С ПОДСВЕТКОЙ
function getSnippet(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text.substring(0, 100) + '...';
    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + query.length + 40);
    const snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
    return snippet.replace(new RegExp(`(${query})`, 'gi'), '<mark class="search-match">$1</mark>');
}

// 3. ИСПРАВЛЕННЫЙ INITSEARCH (АВТОСКРЫТИЕ)
function initSearch() {
    const input = document.getElementById('wiki-search');
    if (!input) return;
    
    input.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.wiki-tree a').forEach(a => {
            const match = a.textContent.toLowerCase().includes(q);
            a.style.display = (q === '' || match) ? '' : 'none';
        });
        document.querySelectorAll('.wiki-folder').forEach(f => {
            const has = Array.from(f.querySelectorAll('a')).some(a => a.style.display !== 'none');
            f.style.display = (q === '' || has) ? '' : 'none';
            if (q !== '' && has) f.classList.add('open');
            else if (q === '') f.classList.remove('open');
        });
    });
}

// 4. ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ URL (ПЕРЕЗАГРУЗКА)
document.addEventListener('DOMContentLoaded', async () => {
    // Если есть ?page=, меняем URL на /archive/страница без перезагрузки
    const params = new URLSearchParams(window.location.search);
    if (params.has('page')) {
        const newUrl = '/archive/' + params.get('page');
        window.history.replaceState(null, null, newUrl);
    }
    
    initSearch();
    await loadArticle();
    updateActiveSidebarLink();
});

// Асинхронный переход
async function performTransition(targetUrl) {
    appContainer.classList.add('scale-down');
    window.history.pushState(null, null, targetUrl);
    await loadArticle();
    updateActiveSidebarLink();
    appContainer.classList.remove('scale-down');
}