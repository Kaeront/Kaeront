const CACHE_NAME = 'kaeront-assets-v3';
const OFFLINE_URL = '/offline.html';

// Полный список ресурсов для верстки оффлайн-страницы
const ASSETS_TO_CACHE = [
    OFFLINE_URL,
    '/assets/global.js',
    '/assets/unavailable.png',
    '/assets/unavailable_favicon.png',
    '/assets/blackstone_top.png',
    '/assets/minecraft.ttf',
    '/assets/uniform.otf'
];

// 1. Установка с обходом редиректов Vercel (redirect: 'follow')
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const url of ASSETS_TO_CACHE) {
                try {
                    // Переход по редиректам Vercel (cleanUrls)
                    const response = await fetch(url, { redirect: 'follow' });
                    if (response.ok) {
                        await cache.put(url, response);
                    }
                } catch (err) {
                    console.warn('[SW] Не удалось закэшировать ресурс:', url, err);
                }
            }
        })
    );
    self.skipWaiting();
});

// 2. Активация и авто-очистка устаревших кэшей
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

// 3. Перехват и безопасная обработка запросов
self.addEventListener('fetch', (event) => {
    // Игнорируем все не-GET запросы (POST, OPTIONS и т.д.)
    if (event.request.method !== 'GET') return;

    // 3.1. Переходы по страницам (HTML)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                const cachedOffline = await cache.match(OFFLINE_URL);
                return cachedOffline || Response.error();
            })
        );
        return;
    }

    // 3.2. Статические ресурсы (Stale-While-Revalidate)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Кэшируем только успешные ответы с нашего домена
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {/* Игнорируем сетевые ошибки в фоновом режиме */});

            return cachedResponse || fetchPromise;
        })
    );
});

// 4. Push-уведомления
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

// 5. Обработка клика по уведомлению
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
