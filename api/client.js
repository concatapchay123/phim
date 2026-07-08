const {
    API_BASE_URL,
    buildClientApiUrl,
    checkRateLimit,
    getSecurityLockRetryAfter,
    isSameOriginRequest,
    isSecurityLockedRequest,
    sanitizeUpstreamData,
    setSecurityHeaders
} = require('./_security');

const FALLBACK_API_BASE_URL = (process.env.FALLBACK_MOVIE_API_BASE_URL || 'https://phimapi.com').replace(/\/+$/, '');
const UPSTREAM_TIMEOUT_MS = Math.max(900, Number(process.env.MOVIE_API_TIMEOUT_MS || 2600));
const FALLBACK_TIMEOUT_MS = Math.max(1200, Number(process.env.FALLBACK_MOVIE_API_TIMEOUT_MS || 3600));
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
    k: { ttl: 86400, stale: 3600 }
};

function getClientCacheControl(kind) {
    const cache = CLIENT_CACHE_BY_KIND[String(kind || '')] || { ttl: 300, stale: 60 };
    const browserMaxAge = Math.min(90, Math.max(20, Math.floor(cache.ttl / 6)));
    return `public, max-age=${browserMaxAge}, s-maxage=${cache.ttl}, stale-while-revalidate=${cache.stale}`;
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

function buildFallbackUrl(primaryUrl) {
    if (!FALLBACK_API_BASE_URL || FALLBACK_API_BASE_URL === API_BASE_URL) return null;
    return new URL(`${FALLBACK_API_BASE_URL}${primaryUrl.pathname}${primaryUrl.search}`);
}

async function fetchJsonWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url.toString(), {
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            const error = new Error(`Upstream error: ${response.status}`);
            error.statusCode = response.status;
            throw error;
        }

        return response.json();
    } finally {
        clearTimeout(timer);
    }
}

async function fetchUpstreamJson(primaryUrl) {
    try {
        return await fetchJsonWithTimeout(primaryUrl, UPSTREAM_TIMEOUT_MS);
    } catch (primaryError) {
        const fallbackUrl = buildFallbackUrl(primaryUrl);
        const canFallback = fallbackUrl && (!primaryError.statusCode || primaryError.statusCode >= 500 || primaryError.name === 'AbortError');
        if (!canFallback) throw primaryError;

        try {
            return await fetchJsonWithTimeout(fallbackUrl, FALLBACK_TIMEOUT_MS);
        } catch (fallbackError) {
            fallbackError.statusCode = fallbackError.statusCode || primaryError.statusCode;
            throw fallbackError;
        }
    }
}

function refreshMemoryCache(cacheKey, targetUrl, kind) {
    fetchUpstreamJson(targetUrl)
        .then(data => setMemoryCache(cacheKey, sanitizeUpstreamData(data), kind))
        .catch(error => console.warn('Client API background refresh failed:', error.message));
}

module.exports = async (req, res) => {
    const kind = req.query.q || req.query.kind;
    setSecurityHeaders(res, {
        cacheControl: getClientCacheControl(kind)
    });
    res.setHeader('Vary', 'Cookie');

    const requestPath = (() => {
        try {
            return new URL(req.url || '', 'http://localhost').pathname;
        } catch (error) {
            return '';
        }
    })();

    if (requestPath === '/api/client' || requestPath.endsWith('/client')) {
        return res.status(404).json({ error: 'Endpoint disabled' });
    }

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'GET, OPTIONS');
        return res.status(204).end();
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET, OPTIONS');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isSameOriginRequest(req)) {
        return res.status(403).json({ error: 'Cross-origin API access is blocked' });
    }

    if (isSecurityLockedRequest(req)) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        return res.status(423).json({ error: 'Security lock is active' });
    }

    const rateLimit = checkRateLimit(req, { prefix: 'client', limit: 160 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        return res.status(429).json({ error: 'Too many requests' });
    }

    try {
        const targetUrl = buildClientApiUrl(kind, req.query);
        const cacheKey = targetUrl.pathname + targetUrl.search;
        const cached = getMemoryCache(cacheKey);

        if (cached) {
            res.setHeader('X-QC-Cache', cached.state === 'fresh' ? 'HIT' : 'STALE');
            if (cached.state === 'stale') refreshMemoryCache(cacheKey, targetUrl, kind);
            return res.status(200).json(cached.data);
        }

        const data = sanitizeUpstreamData(await fetchUpstreamJson(targetUrl));
        setMemoryCache(cacheKey, data, kind);
        res.setHeader('X-QC-Cache', 'MISS');
        return res.status(200).json(data);
    } catch (error) {
        console.error('Client API error:', error.message);
        return res.status(error.statusCode || 500).json({ error: 'Internal API error' });
    }
};
