/* ARCHIVE.KAERONT.RU GLOBAL CORE & SMART HYBRID ROUTER */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

// Настраиваем парсер Marked: включаем поддержку обычных переносов строк (breaks)
marked.setOptions({
    breaks: true,
    gfm: true
});

// Проверяем, запущен ли сайт локально. Это чисто для меня (KAmir213)
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

// Получаем чистый путь статьи в зависимости от режима (локальный/продакшн)
function getCleanRoute() {
    if (isLocal) {
        const hash = window.location.hash;
        return (hash === '' || hash === '#/') ? 'index' : hash.replace('#/', '');
    } else {
        const path = window.location.pathname;
        return (path === '/' || path === '/index') ? 'index' : path.replace('/', '');
    }
}

// Загрузка Markdown-файла
async function loadArticle() {
    const routeName = getCleanRoute();
    const filePath = `/${routeName}.md`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Статья отсутствует');
        const markdownText = await response.text();
        
        // Рендерим Markdown + HTML
        contentContainer.innerHTML = marked.parse(markdownText);
    } catch (error) {
        contentContainer.innerHTML = `
            <h1>Статья не найдена</h1>
            <p>Документ <code>${routeName}.md</code> ещё не создан или находится в разработке.</p>
        `;
    }
}

// Плавный переход с анимацией scale-down (по кривой easeInOutQuint)
function performTransition(targetUrl) {
    appContainer.classList.add('scale-down');

    setTimeout(async () => {
        if (isLocal) {
            // В Acode меняем хэш
            window.location.hash = targetUrl.startsWith('/') ? '#' + targetUrl : targetUrl;
        } else {
            // На продакшене меняем URL красиво через History API
            window.history.pushState(null, null, targetUrl);
            await loadArticle();
            updateActiveSidebarLink();
        }
        
        window.scrollTo(0, 0);
        appContainer.classList.remove('scale-down');
    }, 200);
}

// Подсветка текущей страницы в сайдбаре
function updateActiveSidebarLink() {
    const currentRoute = getCleanRoute();
    const links = document.querySelectorAll('.category-links a');
    
    links.forEach(link => {
        // Берем чистый путь из href ссылки (убираем # и / для сравнения)
        const linkRoute = link.getAttribute('href').replace('#', '').replace('/', '') || 'index';
        
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
        const targetUrl = target.getAttribute('href').replace('#', ''); // Получаем чистый путь вроде "/legends"
        performTransition(targetUrl);
    }
});

// Слушатели изменений истории браузера
if (isLocal) {
    window.addEventListener('hashchange', () => {
        appContainer.classList.add('scale-down');
        setTimeout(async () => {
            await loadArticle();
            updateActiveSidebarLink();
            appContainer.classList.remove('scale-down');
        }, 200);
    });
} else {
    window.addEventListener('popstate', () => {
        appContainer.classList.add('scale-down');
        setTimeout(async () => {
            await loadArticle();
            updateActiveSidebarLink();
            appContainer.classList.remove('scale-down');
        }, 200);
    });
}

// Инициализация при первой загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadArticle();
    updateActiveSidebarLink();
});
