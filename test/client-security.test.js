const test = require('node:test');
const assert = require('node:assert/strict');

const clientHandler = require('../api/client');

function createResponse() {
    const headers = new Map();
    return {
        statusCode: 200,
        body: undefined,
        setHeader(name, value) { headers.set(String(name).toLowerCase(), value); },
        getHeader(name) { return headers.get(String(name).toLowerCase()); },
        status(code) { this.statusCode = code; return this; },
        json(value) { this.body = value; return this; }
    };
}

function request(overrides = {}) {
    return {
        method: 'GET',
        url: '/api/c?q=j',
        query: { q: 'j' },
        headers: { host: 'localhost:3000', 'sec-fetch-site': 'same-origin' },
        ...overrides
    };
}

test('catalogue response is never stored in the shared CDN cache', async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({
        ok: true,
        json: async () => ({ status: 'success', data: { items: [] } })
    });

    try {
        const res = createResponse();
        await clientHandler(request(), res);

        assert.equal(res.statusCode, 200);
        assert.match(res.getHeader('cache-control'), /^private, max-age=/);
        assert.equal(res.getHeader('cdn-cache-control'), 'no-store');
        assert.equal(res.getHeader('vercel-cdn-cache-control'), 'no-store');
        assert.match(res.getHeader('vary'), /Sec-Fetch-Site/);
    } finally {
        global.fetch = originalFetch;
    }
});

test('catalogue API rejects a request without same-origin browser metadata', async () => {
    const res = createResponse();
    await clientHandler(request({ headers: { host: 'localhost:3000' } }), res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.getHeader('cache-control'), 'private, no-store');
    assert.equal(res.getHeader('vercel-cdn-cache-control'), 'no-store');
});
