// sw.js - Service Worker для обработки уведомлений и кликов
self.addEventListener('push', (event) => {
    if (!event.data) return;
    const data = event.data.json();
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/assets/bubble.png',
            tag: `msg-${data.channel}`, // тег группирует сообщения одного канала
            data: { channel: data.channel },
            renotify: true, // Показать уведомление даже если тег тот же
            requireInteraction: true // Не закрывать автоматически
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const channel = event.notification.data.channel;
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Если вкладка есть, фокусим её
            for (const client of clientList) {
                if (client.url.includes('/chat') && 'focus' in client) {
                    client.postMessage({ action: 'SWITCH_CHANNEL', channel: channel });
                    return client.focus();
                }
            }
            // Если вкладки нет, открываем новую
            return clients.openWindow(`/chat/${channel}`);
        })
    );
});
