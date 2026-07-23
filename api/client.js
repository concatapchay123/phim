const {
    assertSecurityConfiguration,
    checkRateLimit,
    getSecurityLockRetryAfter,
    isSameOriginRequest,
    isSecurityLockedRequest,
    sanitizeUpstreamData,
    setSecurityHeaders
} = require('./_security');
const { fetchUnified } = require('./_providers');

const RESPONSE_CACHE_MAX_ENTRIES = Math.max(50, Number(process.env.API_RESPONSE_CACHE_MAX_ENTRIES || 220));
const responseCache = new Map();

const CLIENT_CACHE_BY_KIND = {
    a: { ttl: 600, stale: 300 },
    b: { ttl: 600, stale: 300 },
    c: { ttl: 600, stale: 300 },
    d: { ttl: 600, stale: 300 },
    e: { ttl: 120, stale: 60 },
    f: { ttl: 1800, stale: 900 },
    g: { ttl: 21600, stale: 3600 },
    h: { ttl: 600, stale: 300 },
    i: { ttl: 600, stale: 300 },
    j: { ttl: 86400, stale: 3600 },
    k: { ttl: 86400, stale: 3600 },
    l: { ttl: 86400, stale: 3600 },
    m: { ttl: 21600, stale: 3600 },
    n: { ttl: 21600, stale: 3600 }
};

function getClientCacheControl(kind) {
    const cache = CLIENT_CACHE_BY_KIND[String(kind || '')] || { ttl: 300, stale: 60 };
    const browserMaxAge = Math.min(cache.ttl, Math.max(60, Math.floor(cache.ttl / 2)));
    // This endpoint performs a same-origin check before returning catalogue
    // data.  A shared CDN cache can serve a cached 200 response before the
    // function runs, allowing a later cross-origin request to bypass that
    // check. Keep short browser caching, but never cache this route publicly.
    return `private, max-age=${browserMaxAge}, stale-while-revalidate=${cache.stale}`;
}

function getClientCdnCacheControl(kind) {
    // See getClientCacheControl: the function-level cache and the client's
    // local cache still avoid repeated upstream work without creating a CDN
    // cache bypass for the request-origin guard.
    return 'no-store';
}

function applyClientCacheHeaders(res, kind) {
    const cdnCacheControl = getClientCdnCacheControl(kind);
    res.setHeader('Cache-Control', getClientCacheControl(kind));
    res.setHeader('CDN-Cache-Control', cdnCacheControl);
    res.setHeader('Vercel-CDN-Cache-Control', cdnCacheControl);
    res.setHeader('Vary', 'Origin, Referer, Sec-Fetch-Site, Cookie');
}

function applyNoStoreHeaders(res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
}

function getClientCachePolicy(kind) {
    return CLIENT_CACHE_BY_KIND[String(kind || '')] || { ttl: 300, stale: 60 };
}

function getMemoryCache(cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (cached.expiresAt > now) return { state: 'fresh', data: cached.data };
    if (cached.staleExpiresAt > now) return { state: 'stale', data: cached.data };

    responseCache.delete(cacheKey);
    return null;
}

function setMemoryCache(cacheKey, data, kind) {
    const policy = getClientCachePolicy(kind);
    const now = Date.now();
    responseCache.set(cacheKey, {
        data,
        expiresAt: now + policy.ttl * 1000,
        staleExpiresAt: now + (policy.ttl + policy.stale) * 1000
    });

    if (responseCache.size > RESPONSE_CACHE_MAX_ENTRIES) {
        const overflow = responseCache.size - RESPONSE_CACHE_MAX_ENTRIES;
        Array.from(responseCache.keys()).slice(0, overflow).forEach(key => responseCache.delete(key));
    }
}

function getUnifiedCacheKey(kind, query) {
    const entries = Object.keys(query || {})
        .filter(key => !['q', 'kind'].includes(key))
        .sort()
        .map(key => `${key}=${Array.isArray(query[key]) ? query[key][0] : query[key]}`);
    return `unified:${kind}:${entries.join('&')}`;
}

function refreshMemoryCache(cacheKey, kind, query) {
    fetchUnified(fetch, kind, query)
        .then(data => setMemoryCache(cacheKey, sanitizeUpstreamData(data), kind))
        .catch(error => console.warn('Client API background refresh failed:', error.message));
}

module.exports = async (req, res) => {
    const kind = req.query.q || req.query.kind;
    setSecurityHeaders(res);

    try {
        assertSecurityConfiguration();
    } catch (error) {
        applyNoStoreHeaders(res);
        return res.status(error.statusCode || 503).json({ error: 'Service temporarily unavailable' });
    }

    const requestPath = (() => {
        try {
            return new URL(req.url || '', 'http://localhost').pathname;
        } catch (error) {
            return '';
        }
    })();

    if (requestPath === '/api/client' || requestPath.endsWith('/client')) {
        applyNoStoreHeaders(res);
        return res.status(404).json({ error: 'Endpoint disabled' });
    }

    if (req.method === 'OPTIONS') {
        applyNoStoreHeaders(res);
        res.setHeader('Allow', 'GET, OPTIONS');
        return res.status(204).end();
    }

    if (req.method !== 'GET') {
        applyNoStoreHeaders(res);
        res.setHeader('Allow', 'GET, OPTIONS');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isSameOriginRequest(req)) {
        applyNoStoreHeaders(res);
        return res.status(403).json({ error: 'Cross-origin API access is blocked' });
    }

    if (isSecurityLockedRequest(req)) {
        applyNoStoreHeaders(res);
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        return res.status(423).json({ error: 'Security lock is active' });
    }

    const rateLimit = checkRateLimit(req, { prefix: 'client', limit: 160 });
    if (!rateLimit.ok) {
        applyNoStoreHeaders(res);
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        return res.status(429).json({ error: 'Too many requests' });
    }

    try {
        const cacheKey = getUnifiedCacheKey(kind, req.query);
        const cached = getMemoryCache(cacheKey);

        if (cached) {
            applyClientCacheHeaders(res, kind);
            res.setHeader('X-QC-Cache', cached.state === 'fresh' ? 'HIT' : 'STALE');
            if (cached.state === 'stale') refreshMemoryCache(cacheKey, kind, req.query);
            return res.status(200).json(cached.data);
        }

        const data = sanitizeUpstreamData(await fetchUnified(fetch, kind, req.query));
        setMemoryCache(cacheKey, data, kind);
        applyClientCacheHeaders(res, kind);
        res.setHeader('X-QC-Cache', 'MISS');
        return res.status(200).json(data);
    } catch (error) {
        console.error('Client API error:', error.message);
        applyNoStoreHeaders(res);
        return res.status(error.statusCode || 500).json({ error: 'Internal API error' });
    }
};
