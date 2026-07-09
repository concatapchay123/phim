// Vercel Catch-All API Route
const {
    buildUpstreamApiUrl,
    checkRateLimit,
    getSecurityLockRetryAfter,
    isSameOriginRequest,
    isSecurityLockedRequest,
    sanitizeUpstreamData,
    setSecurityHeaders
} = require('./_security');

function applyProxyCacheHeaders(res) {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=60');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
}

function applyNoStoreHeaders(res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
}

module.exports = async (req, res) => {
    setSecurityHeaders(res);

    if (process.env.ENABLE_LEGACY_PROXY !== 'true') {
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

    const rateLimit = checkRateLimit(req, { prefix: 'api', limit: 160 });
    if (!rateLimit.ok) {
        applyNoStoreHeaders(res);
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        return res.status(429).json({ error: 'Too many requests' });
    }

    // req.query.path is an array of path segments, e.g. ['v1', 'api', 'home']
    const pathSegments = req.query.path;

    if (!pathSegments || pathSegments.length === 0) {
        applyNoStoreHeaders(res);
        return res.status(400).json({ error: 'Missing path' });
    }

    try {
        const upstreamPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
        const targetUrl = buildUpstreamApiUrl(`/${upstreamPath}`, req.query);
        const response = await fetch(targetUrl.toString(), {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (!response.ok) {
            applyNoStoreHeaders(res);
            return res.status(response.status).json({
                error: `Upstream error: ${response.status} ${response.statusText}`
            });
        }

        const data = await response.json();
        applyProxyCacheHeaders(res);
        return res.status(200).json(sanitizeUpstreamData(data));
    } catch (error) {
        console.error('Proxy error:', error.message);
        applyNoStoreHeaders(res);
        return res.status(error.statusCode || 500).json({ error: 'Internal proxy error' });
    }
};
