/* ARCHIVE.KAERONT.RU GLOBAL CORE & SMART HYBRID ROUTER */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

// Настраиваем парсер Marked
marked.setOptions({
    breaks: true,
    gfm: true
});

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

// Получаем чистый путь статьи
function getCleanRoute() {
    if (isLocal) {
        const hash = window.location.hash;
        const cleanHash = hash.replace('#/archive/', '').replace('#/', '').replace('#', '');
        return (cleanHash === '' || cleanHash === 'index' || cleanHash === 'archive') ? 'index' : cleanHash;
    } else {
        const path = window.location.pathname;
        
        // 1. Проверяем, пришли ли мы по редиректу с параметром ?page=...
        const urlParams = new URLSearchParams(window.location.search);
        const queryPage = urlParams.get('page');
        
        if (queryPage) {
            return queryPage;
        }

        // 2. Если параметров нет, парсим обычный URL path
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

// Плавный переход с анимацией scale-down
function performTransition(targetUrl) {
    contentContainer.classList.add('scale-down');

    setTimeout(async () => {
        if (isLocal) {
            window.location.hash = targetUrl.startsWith('/') ? '#' + targetUrl : targetUrl;
        } else {
            const cleanUrl = (targetUrl === '/archive/index' || targetUrl === '/archive') ? '/archive' : targetUrl;
            window.history.pushState(null, null, cleanUrl);
            await loadArticle();
            updateActiveSidebarLink();
        }
        
        window.scrollTo(0, 0);
        contentContainer.classList.remove('scale-down');
    }, 200);
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
    window.addEventListener('hashchange', () => {
        contentContainer.classList.add('scale-down');
        setTimeout(async () => {
            await loadArticle();
            updateActiveSidebarLink();
            contentContainer.classList.remove('scale-down');
        }, 200);
    });
} else {
    window.addEventListener('popstate', () => {
        contentContainer.classList.add('scale-down');
        setTimeout(async () => {
            await loadArticle();
            updateActiveSidebarLink();
            contentContainer.classList.remove('scale-down');
        }, 200);
    });
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    if (!isLocal) {
        const urlParams = new URLSearchParams(window.location.search);
        const queryPage = urlParams.get('page');

        if (queryPage) {
            // Если зашли по редиректу с параметром, мгновенно заменяем URL на красивый
            // Например: /archive?page=legends превратится в /archive/legends в строке браузера
            const cleanUrl = queryPage === 'index' ? '/archive' : `/archive/${queryPage}`;
            window.history.replaceState(null, null, cleanUrl);
        } else if (window.location.pathname === '/archive/index') {
            // Убираем "index" из строки браузера на главной архива
            window.history.replaceState(null, null, '/archive');
        }
    }
    
    await loadArticle();
    updateActiveSidebarLink();
});
