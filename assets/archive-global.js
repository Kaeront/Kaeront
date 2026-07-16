/* ARCHIVE.KAERONT.RU GLOBAL CORE - FULL VERSION */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

// Логика получения пути без параметров
function getCleanRoute() {
    const path = window.location.pathname;
    if (path === '/archive' || path === '/archive/') return 'index';
    return path.replace(/^\/archive\//, '').split('?')[0] || 'index';
}

// Принудительное раскрытие папок для активного элемента
function updateActiveSidebarLink() {
    const currentRoute = getCleanRoute();
    const links = document.querySelectorAll('.wiki-tree a');

    links.forEach(link => {
        // Извлекаем путь из ссылки для сравнения
        const linkHref = link.getAttribute('href');
        const linkRoute = linkHref ? linkHref.replace('/archive', '').replace('/', '') || 'index' : '';
        
        if (linkRoute === currentRoute) {
            link.classList.add('active');
            // Раскрываем все родительские папки
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

// Инициализация поиска с исправленным автоскрытием
function initSearch() {
    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const links = document.querySelectorAll('.wiki-tree a');
        const folders = document.querySelectorAll('.wiki-folder');

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

// Асинхронный переход
async function performTransition(targetUrl) {
    appContainer.classList.add('scale-down');
    window.history.pushState(null, null, targetUrl);
    
    // Перезагружаем контент
    await loadArticle();
    updateActiveSidebarLink();
    
    window.scrollTo(0, 0);
    appContainer.classList.remove('scale-down');
}

// Перехват кликов
document.body.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href')?.startsWith('/archive')) {
        e.preventDefault();
        performTransition(link.getAttribute('href'));
    }
});

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    loadArticle();
    updateActiveSidebarLink();
});
