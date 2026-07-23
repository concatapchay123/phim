/* Generated into sw.js by build-service-worker.js. Do not deploy this template. */
const CACHE_VERSION = '7a92de167d36adb8';
const APP_SHELL_CACHE = `qc-shell-${CACHE_VERSION}`;
// Images are content-addressed by their full URL and may safely survive an
// app-shell release. Keeping this cache stable avoids re-downloading posters
// and backdrops merely because JavaScript or CSS changed.
const IMAGE_CACHE = 'qc-images-v1';
const MAX_IMAGE_ENTRIES = 200;
const APP_SHELL = [
  "/app.min.js?v=c0b62a1f23f80f5f",
  "/style.min.css?v=49825187c4d5dc0f",
  "/assets/icons.min.js?v=2b743b1cf2fa1498",
  "/assets/logo.png",
  "/assets/logo-loading.png"
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(APP_SHELL_CACHE)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys
                .filter(key => key.startsWith('qc-') && key !== APP_SHELL_CACHE && key !== IMAGE_CACHE)
                .map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (isExcludedRequest(url, request)) return;

    if (isAppShellRequest(url, request)) {
        event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
        return;
    }

    if (isImageRequest(url, request)) {
        event.respondWith(staleWhileRevalidateImage(request));
    }
});

function isExcludedRequest(url, request) {
    return request.destination === 'video' ||
        request.destination === 'audio' ||
        url.pathname.startsWith('/api/') ||
        url.pathname.includes('/stream') ||
        url.pathname.includes('/player');
}

function isAppShellRequest(url, request) {
    if (url.origin !== self.location.origin || request.mode === 'navigate') return false;
    return url.pathname === '/app.min.js' ||
        url.pathname === '/style.min.css' ||
        url.pathname === '/assets/icons.min.js' ||
        url.pathname === '/assets/logo.png' ||
        url.pathname === '/assets/logo-loading.png' ||
        url.pathname.startsWith('/assets/');
}

function isImageRequest(url, request) {
    return request.destination === 'image' && (url.protocol === 'https:' || url.origin === self.location.origin);
}

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (isCacheable(response)) cache.put(request, response.clone()).catch(() => {});
    return response;
}

async function staleWhileRevalidateImage(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request)
        .then(async response => {
            if (isCacheable(response)) await putImage(cache, request, response.clone());
            return response;
        });

    if (cached) {
        network.catch(() => {});
        return cached;
    }

    try {
        return await network;
    } catch (error) {
        return new Response('', { status: 504, statusText: 'Image unavailable' });
    }
}

function isCacheable(response) {
    return response && (response.ok || response.type === 'opaque');
}

async function putImage(cache, request, response) {
    await cache.put(request, response);
    const keys = await cache.keys();
    const overflow = keys.length - MAX_IMAGE_ENTRIES;
    if (overflow > 0) {
        await Promise.all(keys.slice(0, overflow).map(key => cache.delete(key)));
    }
}
