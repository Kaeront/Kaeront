const CACHE_NAME = 'kaeront-assets-v2';
const OFFLINE_URL = '/offline.html';

// Ресурсы, необходимые для полноценной работы оффлайн-страницы
const ASSETS_TO_CACHE = [
    OFFLINE_URL,
    '/assets/global.js',
    '/assets/unavailable.png',
    '/assets/unavailable_favicon.png'
];

// 1. Установка и предзагрузка ресурсов
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. Активация и удаление старых версий кэша
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Обработка всех запросов (HTML + статические файлы)
self.addEventListener('fetch', (event) => {
    // 3.1. Запросы навигации (переходы по HTML-страницам)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    // 3.2. Запросы статических ресурсов (JS, CSS, Изображения)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Если ресурс есть в кэше — отдаем его мгновенно
                return cachedResponse;
            }
            // Если ресурса нет в кэше — загружаем из сети
            return fetch(event.request);
        })
    );
});

// 4. Push-уведомления (ваш существующий код)
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
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 5. Клик по уведомлению (ваш существующий код)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const channel = event.notification.data ? event.notification.data.channel : null;
    const targetUrl = channel ? `/chat/${channel}` : '/chat';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('/chat') && 'focus' in client) {
                    if (channel) {
                        client.postMessage({ action: 'SWITCH_CHANNEL', channel: channel });
                    }
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
