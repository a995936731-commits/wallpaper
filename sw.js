// Service Worker for PWA
const CACHE_NAME = 'wallpaper-gallery-v1';

// 安装事件
self.addEventListener('install', (event) => {
    console.log('Service Worker: 安装中...');
    self.skipWaiting();
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('Service Worker: 已激活');
    event.waitUntil(clients.claim());
});

// 拦截请求（可选，用于离线支持）
self.addEventListener('fetch', (event) => {
    // 不缓存 Supabase 请求
    if (event.request.url.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
