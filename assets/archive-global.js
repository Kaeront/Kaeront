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

// Загрузка Markdown-файла
async function loadArticle() {
    const routeName = getCleanRoute();
    const filePath = `/archive/${routeName}.md`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Статья отсутствует');
        const markdownText = await response.text();
        
        contentContainer.innerHTML = marked.parse(markdownText);
    } catch (error) {
        contentContainer.innerHTML = `
            <h1>Статья не найдена</h1>
            <p>Документ <code>${routeName}.md</code> ещё не создан или находится в разработке.</p>
        `;
    }
}

// Асинхронный переход с гарантированной анимацией
async function performTransition(targetUrl) {
    // 1. Запускаем увядание контента
    contentContainer.classList.add('scale-down');

    // 2. Ждем окончания CSS-анимации увядания (200мс)
    await new Promise(resolve => setTimeout(resolve, 200));

    // 3. Меняем URL и загружаем контент в "невидимом" режиме
    if (isLocal) {
        window.location.hash = targetUrl.startsWith('/') ? '#' + targetUrl : targetUrl;
    } else {
        const cleanUrl = (targetUrl === '/archive/index' || targetUrl === '/archive') ? '/archive' : targetUrl;
        window.history.pushState(null, null, cleanUrl);
        await loadArticle(); // Ждём полной загрузки новой статьи!
        updateActiveSidebarLink();
    }
    
    window.scrollTo(0, 0);

    // 4. Плавно проявляем новый готовый контент
    contentContainer.classList.remove('scale-down');
}

// Подсветка текущей страницы в сайдбаре
function updateActiveSidebarLink() {
    const currentRoute = getCleanRoute();
    const links = document.querySelectorAll('.category-links a');
    
    links.forEach(link => {
        let linkRoute = link.getAttribute('href')
            .replace('/archive', '')
            .replace('#', '')
            .replace(/^\//, '') || 'index';
            
        if (linkRoute === currentRoute) {
            link.classList.add('active');
            link.closest('.sidebar-category').classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Перехват кликов по ссылкам сайдбара
document.body.addEventListener('click', e => {
    const target = e.target.closest('.category-links a');
    if (target) {
        e.preventDefault();
        const targetUrl = target.getAttribute('href');
        performTransition(targetUrl);
    }
});

// Слушатели изменений истории
if (isLocal) {
    window.addEventListener('hashchange', async () => {
        contentContainer.classList.add('scale-down');
        await new Promise(resolve => setTimeout(resolve, 200));
        await loadArticle();
        updateActiveSidebarLink();
        contentContainer.classList.remove('scale-down');
    });
} else {
    window.addEventListener('popstate', async () => {
        contentContainer.classList.add('scale-down');
        await new Promise(resolve => setTimeout(resolve, 200));
        await loadArticle();
        updateActiveSidebarLink();
        contentContainer.classList.remove('scale-down');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!isLocal) {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');

        if (pageParam) {
            window.history.replaceState(null, null, `/archive/${pageParam}`);
        } else if (window.location.pathname === '/archive/index') {
            window.history.replaceState(null, null, '/archive');
        }
    }
    loadArticle();
    updateActiveSidebarLink();
});
