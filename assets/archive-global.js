/* ARCHIVE.KAERONT.RU GLOBAL CORE & SMART HYBRID ROUTER */

const appContainer = document.getElementById('wiki-app');
const contentContainer = document.getElementById('wiki-content');

marked.setOptions({ breaks: true, gfm: true });

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

function getCleanRoute() {
    const path = window.location.pathname;
    if (path === '/archive' || path === '/archive/') return 'index';
    let route = path.replace(/^\/archive\//, '');
    return route.split('?')[0] || 'index';
}

const STATUS_BANNERS = {
    'dev': `<div class="status-banner dev"><h3>В разработке</h3><p>Идёт активное создание контента. Возможны изменения структуры.</p></div>`,
    'no-images': `<div class="status-banner no-images"><h3>Планируются иллюстрации</h3><p>Страница содержит только текст. Иллюстрации и прочие изображения будут добавлены в ближайшее время.</p></div>`,
    'not-ready': `<div class="status-banner not-ready"><h3>Статья не готова</h3><p>Контент на ранней стадии написания. Возможны неточности или пустые разделы.</p></div>`,
    'outdated': `<div class="status-banner outdated"><h3>Статья могла устареть</h3><p>Статья восстановлена по старым архивам или памяти. Требует сверки с актуальной версией проекта.</p></div>`
};

async function loadArticle() {
    const routeName = getCleanRoute();
    if (routeName === 'search') {
        renderSearchPage();
        return;
    }

    const filePath = `/archive/${routeName}.md`;
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('404');
        let markdownText = await response.text();
        const statusMatch = markdownText.match(/<!--\s*status:\s*(.*?)\s*-->/);
        let bannersHtml = '';
        if (statusMatch && statusMatch[1]) {
            statusMatch[1].split(',').forEach(id => { if (STATUS_BANNERS[id.trim()]) bannersHtml += STATUS_BANNERS[id.trim()]; });
            markdownText = markdownText.replace(statusMatch[0], '');
        }
        contentContainer.innerHTML = bannersHtml + marked.parse(markdownText);
    } catch (error) {
        contentContainer.innerHTML = `<h1>Статья не найдена</h1><p>Документ <code>${routeName}.md</code> ещё не создан.</p>`;
    }
}

const style = document.createElement('style');
style.textContent = `
    mark.search-match { font-weight: bold !important; color: #ff9900 !important; background: rgba(255, 153, 0, 0.2) !important; padding: 0 4px !important; border-radius: 3px !important; }
    .search-input-field { width: 100%; padding: 12px; background: #0d0d0d; border: 1px solid #222; color: #fff; border-radius: 4px; }
    .search-result-card { border: 1px solid #1a1a1a; background: #050505; padding: 20px; margin-bottom: 15px; cursor: pointer; border-radius: 4px; }
    .sidebar-match { font-weight: bold !important; color: #ff9900 !important; background: rgba(255, 153, 0, 0.1) !important; }
    .search-hidden { display: none !important; }
`;
document.head.appendChild(style);

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

async function renderSearchPage() {
    const query = new URLSearchParams(window.location.search).get('q') || '';
    contentContainer.innerHTML = `<h1>Поиск</h1><input type="text" class="search-input-field" value="${escapeHtml(query)}" placeholder="Поиск..."> <div id="results-list"></div>`;
    
    const input = contentContainer.querySelector('.search-input-field');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') performTransition('/archive/search?q=' + encodeURIComponent(input.value.trim())); });

    if (!query.trim()) return;
    const links = Array.from(document.querySelectorAll('.wiki-tree a'));
    const results = [];
    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href || href.includes('search') || !href.startsWith('/archive')) continue;
        try {
            const res = await fetch(`${href}.md`);
            if (!res.ok) continue;
            const text = await res.text();
            if (text.toLowerCase().includes(query.toLowerCase())) {
                results.push({ title: link.textContent.trim(), href: href, snippet: text.substring(0, 100) });
            }
        } catch (e) {}
    }
    document.getElementById('results-list').innerHTML = results.map(r => `<div class="search-result-card" onclick="performTransition('${r.href}')"><h3>${escapeHtml(r.title)}</h3></div>`).join('');
}

function initSearch() {
    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) return;

    let phantomLink = document.querySelector('.phantom-search-link') || document.createElement('a');
    phantomLink.className = 'phantom-search-link';
    phantomLink.style.cssText = 'display:none; padding:10px; color:var(--accent); cursor:pointer; font-size:0.7rem;';
    if (!phantomLink.parentNode) searchInput.parentNode.insertBefore(phantomLink, searchInput.nextSibling);

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const links = document.querySelectorAll('.wiki-tree a:not(.phantom-search-link)');
        const folders = document.querySelectorAll('.wiki-tree .wiki-folder');

        phantomLink.style.display = query ? 'block' : 'none';
        phantomLink.textContent = `Результаты для «${query}»`;
        phantomLink.onclick = () => performTransition('/archive/search?q=' + encodeURIComponent(query));

        links.forEach(link => {
            const match = link.textContent.toLowerCase().includes(query);
            link.classList.toggle('search-hidden', query ? !match : false);
            link.innerHTML = query && match ? link.textContent.replace(new RegExp(`(${query})`, 'gi'), '<span class="sidebar-match">$1</span>') : link.textContent;
        });

        folders.forEach(f => {
            const hasVisible = f.querySelectorAll('a:not(.search-hidden)').length > 0;
            f.style.display = (query === '' || hasVisible) ? '' : 'none';
            if (query !== '' && hasVisible) f.classList.add('open');
            else if (query === '') f.classList.remove('open');
        });
    });
}

async function performTransition(targetUrl) {
    appContainer.classList.add('scale-down');
    window.history.pushState(null, null, targetUrl);
    await loadArticle();
    updateActiveSidebarLink();
    window.scrollTo(0, 0);
    appContainer.classList.remove('scale-down');
}

function updateActiveSidebarLink() {
    const currentRoute = getCleanRoute();
    document.querySelectorAll('.wiki-tree a').forEach(link => {
        const linkRoute = link.getAttribute('href').replace('/archive', '').replace('/', '') || 'index';
        link.classList.toggle('active', linkRoute === currentRoute);
    });
}

document.body.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href')?.startsWith('/archive')) {
        e.preventDefault();
        performTransition(link.getAttribute('href'));
    }
});

window.addEventListener('popstate', async () => { await loadArticle(); updateActiveSidebarLink(); });

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    loadArticle();
    updateActiveSidebarLink();
});
