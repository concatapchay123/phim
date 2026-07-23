const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class StorageMock {
    constructor({ failWrites = false } = {}) {
        this.failWrites = failWrites;
    }

    getItem(key) {
        return Object.prototype.hasOwnProperty.call(this, key) ? this[key] : null;
    }

    setItem(key, value) {
        if (this.failWrites) throw new Error('Storage unavailable');
        this[key] = String(value);
    }

    removeItem(key) {
        delete this[key];
    }
}

function loadClientCache({ localStorage = new StorageMock(), sessionStorage = new StorageMock(), fetch } = {}) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
    const cacheStart = source.indexOf('const API_CACHE_TTL =');
    const movieHelpersStart = source.indexOf('function getMovieStorageId');
    const fetchStart = source.indexOf('async function fetchApiFromNetwork');
    const themeStart = source.indexOf('// THEME MANAGER');

    assert.ok(cacheStart >= 0 && movieHelpersStart > cacheStart, 'client cache helpers must exist');
    assert.ok(fetchStart >= 0 && themeStart > fetchStart, 'cached API fetch helpers must exist');

    const endpointConstants = `
        const API_CACHE_PREFIX = 'qc_cache_v12_';
        const KK_HOME = 'a'; const KK_PHIM_BO = 'b'; const KK_PHIM_LE = 'c';
        const KK_PHIM_CHIEU_RAP = 'd'; const KK_SEARCH = 'e'; const KK_DETAILS = 'f';
        const KK_IMAGES = 'g'; const KK_GENRE = 'h'; const KK_COUNTRY = 'i';
        const KK_GENRES = 'j'; const KK_COUNTRIES = 'k'; const ROUTE_CLIENT = '/api/c';
    `;
    const context = vm.createContext({
        URL,
        Promise,
        setTimeout,
        clearTimeout,
        console: { warn() {}, error() {} },
        navigator: {},
        window: { location: { origin: 'https://quanchill.test' } },
        localStorage,
        sessionStorage,
        fetch: fetch || (async () => ({ ok: true, json: async () => ({ status: 'success', data: {} }) }))
    });

    vm.runInContext(`${endpointConstants}\n${source.slice(cacheStart, movieHelpersStart)}\n${source.slice(fetchStart, themeStart)}\nglobalThis.__clientCache = { buildApiRequest, readApiCache, writeApiCache, fetchAPI, getApiCacheStorage };`, context);
    return { api: context.__clientCache, localStorage, sessionStorage };
}

test('client API cache canonicalises keys and serves stale entries while refreshing them', async () => {
    let fetchCount = 0;
    const { api, localStorage } = loadClientCache({
        fetch: async () => {
            fetchCount += 1;
            return { ok: true, json: async () => ({ status: 'success', data: { version: 'fresh' } }) };
        }
    });
    const first = api.buildApiRequest('a', { slug: 'test-film', page: 2 });
    const reordered = api.buildApiRequest('a', { page: 2, slug: 'test-film' });
    assert.equal(first.cacheKey, reordered.cacheKey);
    assert.match(first.cacheKey, /[?&]s=test-film/);

    localStorage.setItem(first.cacheKey, JSON.stringify({
        data: { status: 'success', data: { version: 'stale' } },
        expiresAt: Date.now() - 1,
        staleExpiresAt: Date.now() + 60_000
    }));

    const result = await api.fetchAPI('a', { page: 2, slug: 'test-film' });
    assert.equal(result.data.version, 'stale');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(fetchCount, 1);
    assert.equal(api.readApiCache(first.cacheKey).data.version, 'fresh');
});

test('client API cache deduplicates in-flight requests, evicts overflow, and falls back to session storage', async () => {
    let fetchCount = 0;
    let resolveResponse;
    const response = new Promise(resolve => { resolveResponse = resolve; });
    const { api, localStorage } = loadClientCache({
        fetch: async () => {
            fetchCount += 1;
            return response;
        }
    });

    const first = api.fetchAPI('a', { page: 1 });
    const second = api.fetchAPI('a', { page: 1 });
    resolveResponse({ ok: true, json: async () => ({ status: 'success', data: { page: 1 } }) });
    await Promise.all([first, second]);
    assert.equal(fetchCount, 1);

    for (let page = 0; page < 91; page += 1) {
        api.writeApiCache(`qc_cache_v12_test_${page}`, { status: 'success', data: { page } }, 'a');
    }
    const entries = Object.keys(localStorage).filter(key => key.startsWith('qc_cache_v12_'));
    assert.equal(entries.length, 90);

    const sessionOnly = loadClientCache({ localStorage: new StorageMock({ failWrites: true }) });
    const key = sessionOnly.api.buildApiRequest('j').cacheKey;
    sessionOnly.api.writeApiCache(key, { status: 'success', data: { cached: true } }, 'j');
    assert.equal(sessionOnly.api.getApiCacheStorage(), sessionOnly.sessionStorage);
    assert.equal(sessionOnly.api.readApiCache(key).data.cached, true);
});
