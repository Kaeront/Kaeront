/* WIKI.KAERONT.RU GLOBAL CORE & SMART HYBRID ROUTER (SUBFOLDER MODE) */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

// Настраиваем парсер Marked
marked.setOptions({
    breaks: true,
    gfm: true
});

// Проверяем локальный запуск
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

// Получаем чистый путь статьи
function getCleanRoute() {
    if (isLocal) {
        const hash = window.location.hash;
        // Убираем хэш и папку archive из пути при локальном тесте, если они есть
        return (hash === '' || hash === '#/' || hash === '#/archive/') 
            ? 'index' 
            : hash.replace('#/archive/', '').replace('#/', '');
    } else {
        const path = window.location.pathname;
        // Отрезаем "/archive" из пути, чтобы получить чистое имя файла (например, "/archive/legends" -> "legends")
        const relativePath = path.replace('/archive', '');
        return (relativePath === '/' || relativePath === '' || relativePath === '/index') ? 'index' : relativePath.replace('/', '');
    }
}

// Загрузка Markdown-файла
async function loadArticle() {
    const routeName = getCleanRoute();
    // Теперь файлы .md всегда запрашиваются из папки /archive/
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

// Подсветка текущей страницы в сайдбаре
function updateActiveSidebarLink() {
    const currentRoute = getCleanRoute();
    const links = document.querySelectorAll('.category-links a');
    
    links.forEach(link => {
        // Получаем чистый роут из ссылки архива
        const linkRoute = link.getAttribute('href')
            .replace('/archive', '')
            .replace('#', '')
            .replace('/', '') || 'index';
        
        if (linkRoute === currentRoute) {
            link.classList.add('active');
            link.closest('.sidebar-category').classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
