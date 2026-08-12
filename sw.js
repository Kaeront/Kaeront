// sw.js - Service Worker для обработки уведомлений и кликов
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Обработка сообщений, отправленных напрямую из вкладки браузера (если потребуется)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        self.registration.showNotification(title, options);
    }
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
