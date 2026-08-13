// sw.js - Service Worker для обработки уведомлений и кликов

// 1. Автоматическое обновление воркера без ожидания закрытия вкладок
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// 2. Немедленный перехват управления всеми открытыми клиентами
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// 3. Обработка входящих Push-уведомлений
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch (e) {
        data = { title: 'Новое сообщение', body: event.data.text() };
    }

    const title = data.title || 'Новое сообщение';
    const options = {
        body: data.body || '',
        icon: data.icon || '/assets/bubble.png',
        badge: data.badge || '/assets/bubble.png',
        tag: data.channel ? `msg-${data.channel}` : 'kaeront-chat-msg',
        data: { channel: data.channel || 'global' },
        renotify: true,
        requireInteraction: true // Оставляет уведомление на столе Windows/macOS до клика
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 4. Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const channel = event.notification.data ? event.notification.data.channel : null;
    const targetUrl = channel ? `/chat/${channel}` : '/chat';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Если вкладка чата уже открыта — переключаем канал и фокусируемся
            for (const client of clientList) {
                if (client.url.includes('/chat') && 'focus' in client) {
                    if (channel) {
                        client.postMessage({ action: 'SWITCH_CHANNEL', channel: channel });
                    }
                    return client.focus();
                }
            }
            // Если открытой вкладки нет — открываем новую
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
