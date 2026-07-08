const {
    buildClientApiUrl,
    checkRateLimit,
    getSecurityLockRetryAfter,
    isSameOriginRequest,
    isSecurityLockedRequest,
    sanitizeUpstreamData,
    setSecurityHeaders
} = require('./_security');

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
    return `public, s-maxage=${cache.ttl}, stale-while-revalidate=${cache.stale}`;
}

module.exports = async (req, res) => {
    setSecurityHeaders(res, {
        cacheControl: getClientCacheControl(req.query.q || req.query.kind)
    });

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
        const targetUrl = buildClientApiUrl(req.query.q || req.query.kind, req.query);
        const response = await fetch(targetUrl.toString(), {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Upstream error: ${response.status}`
            });
        }

        const data = await response.json();
        return res.status(200).json(sanitizeUpstreamData(data));
    } catch (error) {
        console.error('Client API error:', error.message);
        return res.status(error.statusCode || 500).json({ error: 'Internal API error' });
    }
};
