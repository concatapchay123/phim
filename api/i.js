const {
    checkRateLimit,
    getSecurityLockRetryAfter,
    isSameOriginRequest,
    isSecurityLockedRequest,
    resolveImageTarget,
    setSecurityHeaders
} = require('./_security');

module.exports = async (req, res) => {
    setSecurityHeaders(res, {
        cacheControl: 'private, max-age=86400',
        crossOriginResourcePolicy: 'same-origin',
        referrerPolicy: 'no-referrer',
        csp: "default-src 'none'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none'"
    });

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'GET, HEAD, OPTIONS');
        return res.status(204).end();
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD, OPTIONS');
        return res.status(405).send('Method not allowed');
    }

    if (!isSameOriginRequest(req)) {
        return res.status(403).send('Cross-origin image access is blocked');
    }

    if (isSecurityLockedRequest(req)) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        return res.status(423).send('Security lock is active');
    }

    const rateLimit = checkRateLimit(req, { prefix: 'image', limit: 1200 });
    if (!rateLimit.ok) {
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
            return res.status(upstream.status).send('Image source is unavailable');
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        if (!contentType.startsWith('image/')) {
            return res.status(415).send('Unsupported media type');
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'private, max-age=86400');

        if (req.method === 'HEAD') return res.status(200).end();

        const arrayBuffer = await upstream.arrayBuffer();
        return res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error('Image proxy error:', error.message);
        return res.status(error.statusCode || 500).send('Image proxy error');
    }
};
