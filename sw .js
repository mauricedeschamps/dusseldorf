const CACHE_NAME = 'dus-jp-guide-v2';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192.jpg',
  'icons/icon-512.jpg'
  // 外部画像はキャッシュしない（容量・更新問題を避ける）
];

// インストール時に必須リソースをキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // 即座に新しいSWを有効化
  );
});

// フェッチ：キャッシュ優先、なければネットワーク取得してキャッシュ
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(
          fetchResponse => {
            // 有効なレスポンスのみキャッシュ（画像やAPIなど、必要に応じて制限）
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return fetchResponse;
          }
        );
      })
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // 即座に新しいSWがクライアントを制御
  );
});