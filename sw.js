const CACHE_NAME = 'csg-site-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 安裝：預存所有資源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 啟動：清除舊版快取
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 攔截請求：先找快取，沒有才去網路
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then((cached) => cached || fetch(e.request))
  );
});