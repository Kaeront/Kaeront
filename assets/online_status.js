(function initOnlineStatus() {
    async function sendStatusPing() {
        const token = localStorage.getItem('kaeront_access_token');
        if (!token) {
            console.log('[Status Ping] Skipped: No access token in localStorage');
            return;
        }

        try {
            // Расшифровываем UUID из JWT (payload)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const uuid = payload.sub;

            if (!uuid) return;

            const res = await fetch(`/api/v1/users/${uuid}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ server_online: false })
            });

            console.log(`[Status Ping] Sent status ping for ${uuid}. Response:`, res.status);
        } catch (err) {
            console.error('[Status Ping] Failed to send status:', err);
        }
    }

    // Первый запуск сразу
    sendStatusPing();

    // Запуск каждые 60 секунд
    setInterval(sendStatusPing, 60000);
})();
