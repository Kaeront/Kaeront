/* ARCHIVE.KAERONT.RU GLOBAL CORE */
const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

// ГЛАВНОЕ: Читаем путь правильно
function getCleanRoute() {
    const path = window.location.pathname;
    if (path === '/archive' || path === '/archive/') return 'index';
    // Убираем /archive/ из начала пути
    return path.replace(/^\/archive\//, '').split('?')[0] || 'index';
}

async function loadArticle() {
    const route = getCleanRoute();
    if (route === 'search') {
        renderSearchPage();
        return;
    }

    try {
        const response = await fetch(`/archive/${route}.md`);
        if (!response.ok) throw new Error('404');
        const text = await response.text();
        contentContainer.innerHTML = marked.parse(text);
    } catch (e) {
        contentContainer.innerHTML = '<h1>404: Страница не найдена</h1>';
    }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', () => {
    loadArticle();
    updateActiveSidebarLink();
});

// Перехват кликов
document.body.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.pathname.startsWith('/archive')) {
        e.preventDefault();
        window.history.pushState(null, null, link.pathname);
        loadArticle();
        updateActiveSidebarLink();
    }
});
