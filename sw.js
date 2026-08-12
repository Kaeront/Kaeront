// sw.js - Service Worker для обработки уведомлений и кликов
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Получение зашифрованного пуш-уведомления от сервера
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const title = data.title || "Новое сообщение";
        const options = {
            body: data.body || "",
            icon: data.icon || '/assets/bubble.png', 
            badge: '/assets/palm.png',
            tag: `msg-${data.channel}`,
            data: { channel: data.channel }
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (e) {
        console.error("Ошибка парсинга push-данных:", e);
    }
});

// Нажатие на уведомление откроет или сфокусирует вкладку с нужным каналом
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetChannel = event.notification.data ? event.notification.data.channel : 'global';
    const targetUrl = new URL(`/chat/${targetChannel}`, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('/chat') && 'focus' in client) {
                    client.postMessage({ action: 'SWITCH_CHANNEL', channel: targetChannel });
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
