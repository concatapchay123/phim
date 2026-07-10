// Vercel Serverless Function - API Proxy
const {
    assertSecurityConfiguration,
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

    try {
        assertSecurityConfiguration();
    } catch (error) {
        applyNoStoreHeaders(res);
        return res.status(error.statusCode || 503).json({ error: 'Service temporarily unavailable' });
    }

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

    const rateLimit = checkRateLimit(req, { prefix: 'proxy', limit: 160 });
    if (!rateLimit.ok) {
        applyNoStoreHeaders(res);
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        return res.status(429).json({ error: 'Too many requests' });
    }

    const { url: apiPath, ...params } = req.query;

    if (!apiPath) {
        applyNoStoreHeaders(res);
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        const targetUrl = buildUpstreamApiUrl(apiPath, params);
        const response = await fetch(targetUrl.toString(), {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            applyNoStoreHeaders(res);
            return res.status(response.status).json({
                error: `Upstream error: ${response.status}`
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
