/* ARCHIVE.KAERONT.RU GLOBAL CORE */
const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

function getCleanRoute() {
    const path = window.location.pathname;
    if (path === '/archive' || path === '/archive/') return 'index';
    return path.replace(/^\/archive\//, '').split('?')[0] || 'index';
}

function updateActiveSidebarLink() {
    const current = getCleanRoute();
    document.querySelectorAll('.wiki-tree a').forEach(link => {
        const href = link.getAttribute('href') || '';
        const isMatch = href.includes(current) && current !== 'index';
        link.classList.toggle('active', isMatch || (current === 'index' && href === '/archive'));
        if (isMatch) {
            let parent = link.closest('.wiki-folder');
            while (parent) { parent.classList.add('open'); parent = parent.parentElement.closest('.wiki-folder'); }
        }
    });
}

function initSearch() {
    const input = document.getElementById('wiki-search');
    if (!input) return;
    input.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.wiki-tree a').forEach(a => {
            const match = a.textContent.toLowerCase().includes(q);
            a.style.display = (q === '' || match) ? '' : 'none';
        });
        document.querySelectorAll('.wiki-folder').forEach(f => {
            const has = Array.from(f.querySelectorAll('a')).some(a => a.style.display !== 'none');
            f.style.display = (q === '' || has) ? '' : 'none';
            if (q !== '' && has) f.classList.add('open');
        });
    });
}

async function performTransition(url) {
    window.history.pushState(null, null, url);
    await loadArticle();
    updateActiveSidebarLink();
    window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    loadArticle();
    updateActiveSidebarLink();
});
