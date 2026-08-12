// sw.js - Service Worker для обработки фоновых уведомлений и кликов
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Обработка фоновых Push-уведомлений от сервера (Web Push API)
self.addEventListener('push', (event) => {
    let data = { title: 'Kaeront Чат', body: 'Новое сообщение!', channel: 'global', icon: '/assets/id.png' };
    if (event.data) {
        try { data = event.data.json(); } catch(e) {}
    }

    const options = {
        body: data.body,
        icon: data.icon || '/assets/id.png',
        badge: '/assets/id.png',
        data: { channel: data.channel },
        tag: `chat-channel-${data.channel}`
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Нажатие на уведомление откроет или сфокусирует вкладку с нужным каналом
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetChannel = event.notification.data ? event.notification.data.channel : 'global';
    const targetUrl = new URL(`/chat/${targetChannel}`, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Если вкладка чата уже открыта — фокусируемся на ней и переключаем канал через postMessage
            for (const client of clientList) {
                if (client.url.includes('/chat') && 'focus' in client) {
                    client.postMessage({ action: 'SWITCH_CHANNEL', channel: targetChannel });
                    return client.focus();
                }
            }
            // Если вкладок нет — открываем новую страницу с целевым каналом
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
