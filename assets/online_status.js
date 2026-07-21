(function() {
    async function pingSitePresence() {
        try {
            const token = localStorage.getItem('kaeront_access_token');
            if (!token) return;

            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now() || !payload.sub) return;

            await fetch(`/api/v1/users/${payload.sub}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ server_online: false })
            });
        } catch (e) {
            // Игнорируем фоновые ошибки сети
        }
    }

    pingSitePresence();
    setInterval(pingSitePresence, 60000);
})();
