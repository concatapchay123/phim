const {
    assertSecurityConfiguration,
    checkRateLimit,
    getSecurityLockRetryAfter,
    isImageProxyEnabled,
    isSameOriginRequest,
    isSecurityLockedRequest,
    resolveImageTarget,
    setSecurityHeaders
} = require('./_security');

function applyImageCacheHeaders(res) {
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=86400');
}

function applyNoStoreHeaders(res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
}

module.exports = async (req, res) => {
    setSecurityHeaders(res, {
        crossOriginResourcePolicy: 'same-origin',
        referrerPolicy: 'no-referrer',
        csp: "default-src 'none'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none'"
    });

    try {
        assertSecurityConfiguration();
    } catch (error) {
        applyNoStoreHeaders(res);
        return res.status(error.statusCode || 503).send('Service temporarily unavailable');
    }

    if (!isImageProxyEnabled()) {
        applyNoStoreHeaders(res);
        return res.status(404).send('Image proxy is disabled');
    }

    if (req.method === 'OPTIONS') {
        applyNoStoreHeaders(res);
        res.setHeader('Allow', 'GET, HEAD, OPTIONS');
        return res.status(204).end();
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        applyNoStoreHeaders(res);
        res.setHeader('Allow', 'GET, HEAD, OPTIONS');
        return res.status(405).send('Method not allowed');
    }

    if (!isSameOriginRequest(req)) {
        applyNoStoreHeaders(res);
        return res.status(403).send('Cross-origin image access is blocked');
    }

    if (isSecurityLockedRequest(req)) {
        applyNoStoreHeaders(res);
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        return res.status(423).send('Security lock is active');
    }

    const rateLimit = checkRateLimit(req, { prefix: 'image', limit: 1200 });
    if (!rateLimit.ok) {
        applyNoStoreHeaders(res);
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        return res.status(429).send('Too many requests');
    }

    try {
        const targetUrl = resolveImageTarget(req.query);
        const upstream = await fetch(targetUrl, {
            headers: {
                Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!upstream.ok) {
            applyNoStoreHeaders(res);
            return res.status(upstream.status).send('Image source is unavailable');
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        if (!contentType.startsWith('image/')) {
            applyNoStoreHeaders(res);
            return res.status(415).send('Unsupported media type');
        }

        res.setHeader('Content-Type', contentType);
        applyImageCacheHeaders(res);

        if (req.method === 'HEAD') return res.status(200).end();

        const arrayBuffer = await upstream.arrayBuffer();
        return res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error('Image proxy error:', error.message);
        applyNoStoreHeaders(res);
        return res.status(error.statusCode || 500).send('Image proxy error');
    }
};
