(function initSmartOnlineStatus() {
    let lastActivityTime = Date.now();
    const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 минуты бездействия = AFK

    function resetActivity() {
        lastActivityTime = Date.now();
    }

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
        window.addEventListener(event, resetActivity, { passive: true });
    });

    async function sendStatusPing() {
        const token = localStorage.getItem('kaeront_access_token');
        if (!token) return;

        if (document.hidden) return;

        const isIdle = (Date.now() - lastActivityTime) > IDLE_TIMEOUT_MS;
        if (isIdle) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const uuid = payload.sub;
            if (!uuid) return;

            // Используем существующий прокси-рут Vercel v1!
            const res = await fetch(`/api/v1/users/${uuid}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ site_online: true })
            });

            // 1. Аккаунт забанен (FastAPI вернул 403)
            if (res.status === 403) {
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                } else if (typeof checkActiveSession === 'function') {
                    checkActiveSession();
                }
                return;
            }

            // 2. Сессия отозвана / token_version не совпал (FastAPI вернул 401)
            if (res.status === 401) {
                localStorage.removeItem('kaeront_access_token');
                if (window.location.pathname === '/login' && typeof checkActiveSession === 'function') {
                    checkActiveSession();
                } else {
                    window.location.reload();
                }
            }

        } catch (err) {
            console.error('[Status Ping] Error:', err);
        }
    }

    // Запускаем сразу при загрузке
    sendStatusPing();

    // Пингуем каждые 30 секунд
    setInterval(sendStatusPing, 30000);
})();
