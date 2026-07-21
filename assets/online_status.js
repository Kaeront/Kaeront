(function initSmartOnlineStatus() {
    let lastActivityTime = Date.now();
    const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 минуты бездействия = AFK

    // Фиксируем любую активность пользователя
    function resetActivity() {
        lastActivityTime = Date.now();
    }

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
        window.addEventListener(event, resetActivity, { passive: true });
    });

    async function sendStatusPing() {
        const token = localStorage.getItem('kaeront_access_token');
        if (!token) return;

        // Если вкладка свернута/скрыта — не пингуем
        if (document.hidden) {
            console.log('[Status Ping] Skipped: Tab is hidden');
            return;
        }

        // Если пользователь не двигал мышью/клавиатурой больше 2 минут — не пингуем (AFK)
        const isIdle = (Date.now() - lastActivityTime) > IDLE_TIMEOUT_MS;
        if (isIdle) {
            console.log('[Status Ping] Skipped: User is idle/AFK');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const uuid = payload.sub;
            if (!uuid) return;

            await fetch(`/api/v1/users/${uuid}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ site_online: true })
            });

            console.log(`[Status Ping] Active ping sent for ${uuid}`);
        } catch (err) {
            console.error('[Status Ping] Error:', err);
        }
    }

    // Первый запуск сразу
    sendStatusPing();

    // Пингуем каждые 30 секунд
    setInterval(sendStatusPing, 30000);
})();
