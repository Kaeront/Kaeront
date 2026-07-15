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

// Быстрый асинхронный переход (150мс сокрытие, 350мс плавный показ)
async function performTransition(targetUrl) {
    appContainer.classList.add('scale-down');
    await new Promise(resolve => setTimeout(resolve, 150));

    if (isLocal) {
        window.location.hash = targetUrl.startsWith('/') ? '#' + targetUrl : targetUrl;
    } else {
        const cleanUrl = (targetUrl === '/archive/index' || targetUrl === '/archive') ? '/archive' : targetUrl;
        window.history.pushState(null, null, cleanUrl);
    }
    
    await loadArticle(); 
    updateActiveSidebarLink();
    
    window.scrollTo(0, 0);
    appContainer.classList.remove('scale-down');
}

// Подсветка текущей страницы в сайдбаре и автораскрытие папок вверх по дереву
function updateActiveSidebarLink() {
    const currentRoute = getCleanRoute();
    const links = document.querySelectorAll('.wiki-tree a');
    
    links.forEach(link => {
        let linkRoute = link.getAttribute('href')
            .replace('/archive', '')
            .replace('#', '')
            .replace(/^\//, '') || 'index';
            
        if (linkRoute === currentRoute) {
            link.classList.add('active');
            
            // Находим все родительские папки .wiki-folder этой ссылки и плавно раскрываем их
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

// Логика живого поиска по сайдбару
function initSearch() {
    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const links = document.querySelectorAll('.wiki-tree a');
        const folders = document.querySelectorAll('.wiki-tree .wiki-folder');

        // Сброс поиска, если поле ввода пустое
        if (query === '') {
            links.forEach(link => {
                link.classList.remove('search-hidden');
                link.innerHTML = link.textContent; // Сбрасываем подсветку букв
            });
            folders.forEach(folder => {
                folder.classList.remove('search-hidden');
                folder.classList.remove('open');
            });
            updateActiveSidebarLink(); // Раскроет только ту ветку, где мы сейчас находимся
            return;
        }

        // 1. Показываем/скрываем конечные ссылки
        links.forEach(link => {
            const text = link.textContent;
            const textLower = text.toLowerCase();
            const index = textLower.indexOf(query);

            if (index !== -1) {
                link.classList.remove('search-hidden');
                // Подсвечиваем совпавшую часть текста
                link.innerHTML = text.substring(0, index) + 
                                 `<span class="search-match">${text.substring(index, index + query.length)}</span>` + 
                                 text.substring(index + query.length);
            } else {
                link.classList.add('search-hidden');
                link.innerHTML = text;
            }
        });

        // 2. Управляем видимостью и состоянием папок на основе их содержимого
        folders.forEach(folder => {
            // Проверяем, есть ли внутри этой папки хоть одна видимая (подходящая под поиск) ссылка
            const hasVisibleLinks = folder.querySelectorAll('a:not(.search-hidden)').length > 0;

            if (hasVisibleLinks) {
                folder.classList.remove('search-hidden');
                folder.classList.add('open'); // Автоматически раскрываем папки с совпадениями
            } else {
                folder.classList.add('search-hidden');
                folder.classList.remove('open');
            }
        });
    });
}

// УНИВЕРСАЛЬНЫЙ ПЕРЕХВАТ КЛИКОВ (Сайдбар + Контент внутри статей)
document.body.addEventListener('click', e => {
    // Ищем ближайшую ссылку <a>, по которой кликнули
    const link = e.target.closest('a');
    
    if (link) {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('/archive') || href.startsWith('#'))) {
            e.preventDefault();
            performTransition(href);
        }
    }
});

// Слушатели изменений истории (кнопки "Назад/Вперед")
window.addEventListener(isLocal ? 'hashchange' : 'popstate', async () => {
    appContainer.classList.add('scale-down');
    await new Promise(resolve => setTimeout(resolve, 150));
    await loadArticle();
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

    // Инициализируем страницу и поиск
    appContainer.classList.add('scale-down');
    await loadArticle();
    updateActiveSidebarLink();
    initSearch();
    
    // Мягко убираем экран загрузки после рендеринга статьи
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }
    
    setTimeout(() => {
        appContainer.classList.remove('scale-down');
    }, 100);
});