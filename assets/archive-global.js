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

// Быстрый и невесомый переход между страницами
async function performTransition(targetUrl) {
    // 1. Мгновенно запускаем увядание старого контента
    appContainer.classList.add('scale-down');

    // 2. Параллельно подгружаем новую статью и ждем всего 150мс (пока статья качается, экран плавно гаснет)
    const loadPromise = loadArticle();
    await Promise.all([
        loadPromise,
        new Promise(resolve => setTimeout(resolve, 150))
    ]);

    // 3. Быстро обновляем URL и сайдбар
    if (isLocal) {
        window.location.hash = targetUrl.startsWith('/') ? '#' + targetUrl : targetUrl;
    } else {
        const cleanUrl = (targetUrl === '/archive/index' || targetUrl === '/archive') ? '/archive' : targetUrl;
        window.history.pushState(null, null, cleanUrl);
    }
    
    updateActiveSidebarLink();
    window.scrollTo(0, 0);

    // 4. Плавно выталкиваем новый контент на экран
    appContainer.classList.remove('scale-down');
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

// Слушатели изменений истории (кнопки Назад/Вперед)
window.addEventListener(isLocal ? 'hashchange' : 'popstate', async () => {
    appContainer.classList.add('scale-down');
    await Promise.all([
        loadArticle(),
        new Promise(resolve => setTimeout(resolve, 150))
    ]);
    updateActiveSidebarLink();
    appContainer.classList.remove('scale-down');
});

// Первая инициализация при загрузке страницы
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

    // Инициализируем страницу с красивым плавным появлением
    appContainer.classList.add('scale-down');
    await loadArticle();
    updateActiveSidebarLink();
    
    // Мягко убираем экран загрузки после рендеринга статьи
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }
    
    setTimeout(() => {
        appContainer.classList.remove('scale-down');
    }, 50);
});
