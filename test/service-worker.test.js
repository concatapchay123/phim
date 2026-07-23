const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadWorker() {
    const stores = new Map();
    const listeners = new Map();
    const cacheFor = name => {
        if (!stores.has(name)) {
            const entries = new Map();
            stores.set(name, {
                entries,
                match: async request => entries.get(request.url),
                put: async (request, response) => entries.set(request.url, response),
                keys: async () => Array.from(entries.keys()).map(url => ({ url })),
                delete: async request => entries.delete(request.url),
                addAll: async () => {}
            });
        }
        return stores.get(name);
    };
    const context = vm.createContext({
        URL,
        Response,
        Promise,
        console,
        self: {
            location: { origin: 'https://quanchill.test' },
            addEventListener: (name, listener) => listeners.set(name, listener),
            skipWaiting: async () => {},
            clients: { claim: async () => {} }
        },
        caches: {
            open: async name => cacheFor(name),
            keys: async () => Array.from(stores.keys()),
            delete: async name => stores.delete(name)
        },
        fetch: async () => { throw new Error('fetch mock not configured'); }
    });
    const worker = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
    vm.runInContext(`${worker}\nglobalThis.__worker = { APP_SHELL_CACHE, IMAGE_CACHE, MAX_IMAGE_ENTRIES, isExcludedRequest, isAppShellRequest, cacheFirst, staleWhileRevalidateImage, putImage };`, context);
    return { worker: context.__worker, context, stores, listeners };
}

function response(value) {
    return { ok: true, type: 'basic', value, clone() { return response(value); } };
}

test('service worker caches app-shell resources and preserves the image cache across shell versions', async () => {
    const { worker, context, stores } = loadWorker();
    let fetchCount = 0;
    context.fetch = async () => response(++fetchCount);
    const request = { url: 'https://quanchill.test/app.min.js?v=build' };

    assert.equal(worker.IMAGE_CACHE, 'qc-images-v1');
    assert.match(worker.APP_SHELL_CACHE, /^qc-shell-/);
    assert.equal((await worker.cacheFirst(request, worker.APP_SHELL_CACHE)).value, 1);
    assert.equal((await worker.cacheFirst(request, worker.APP_SHELL_CACHE)).value, 1);
    assert.equal(fetchCount, 1);
    assert.equal(stores.get(worker.APP_SHELL_CACHE).entries.size, 1);
});

test('service worker revalidates cached images, caps them, and excludes protected media/API requests', async () => {
    const { worker, context, stores } = loadWorker();
    const imageCache = await context.caches.open(worker.IMAGE_CACHE);
    const poster = { url: 'https://images.test/poster.webp' };
    await imageCache.put(poster, response('old'));
    context.fetch = async () => response('new');

    const cached = await worker.staleWhileRevalidateImage(poster);
    assert.equal(cached.value, 'old');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal((await imageCache.match(poster)).value, 'new');

    for (let index = 0; index <= worker.MAX_IMAGE_ENTRIES; index += 1) {
        await worker.putImage(imageCache, { url: `https://images.test/${index}.webp` }, response(index));
    }
    assert.equal((await imageCache.keys()).length, worker.MAX_IMAGE_ENTRIES);
    assert.equal(worker.isExcludedRequest(new URL('https://quanchill.test/api/c'), { destination: '' }), true);
    assert.equal(worker.isExcludedRequest(new URL('https://quanchill.test/api/stream'), { destination: 'video' }), true);
    assert.equal(worker.isExcludedRequest(new URL('https://quanchill.test/assets/logo.png'), { destination: 'image' }), false);
    assert.ok(stores.has(worker.IMAGE_CACHE));
});
