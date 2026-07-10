const {
    assertSecurityConfiguration,
    checkRateLimit,
    getSecurityLockRetryAfter,
    isSameOriginRequest,
    isSecurityLockedRequest,
    renderPlayerHtml,
    resolveEpisodeSource,
    setSecurityHeaders
} = require('./_security');

module.exports = async (req, res) => {
    setSecurityHeaders(res, {
        allowFrameAncestors: true,
        cacheControl: 'private, no-store',
        crossOriginResourcePolicy: 'same-origin',
        referrerPolicy: 'no-referrer',
        csp: [
            "default-src 'none'",
            "base-uri 'none'",
            "frame-src https:",
            "media-src 'self' https: blob:",
            "connect-src 'self' https:",
            "script-src 'self' 'unsafe-inline'",
            "worker-src 'self' blob:",
            "style-src 'unsafe-inline'",
            "img-src data: https:",
            "form-action 'none'",
            "frame-ancestors 'self'",
            "object-src 'none'"
        ].join('; ')
    });

    try {
        assertSecurityConfiguration();
    } catch (error) {
        return res.status(error.statusCode || 503).send('Service temporarily unavailable');
    }

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'GET, OPTIONS');
        return res.status(204).end();
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET, OPTIONS');
        return res.status(405).send('Method not allowed');
    }

    if (!isSameOriginRequest(req)) {
        return res.status(403).send('Cross-origin player access is blocked');
    }

    if (isSecurityLockedRequest(req)) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        return res.status(423).send('Security lock is active');
    }

    const rateLimit = checkRateLimit(req, { prefix: 'player', limit: 90 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        return res.status(429).send('Too many requests');
    }

    try {
        const source = await resolveEpisodeSource(fetch, {
            slug: req.query.slug,
            episodeIndex: req.query.ep,
            serverIndex: req.query.sv
        });

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(renderPlayerHtml(source, req.query.slug, req.query.ep, req.query.sv));
    } catch (error) {
        console.error('Player resolve error:', error.message);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(error.statusCode || 500).send(renderPlayerHtml({
            type: 'none',
            message: 'Phim hiện đang được cập nhật'
        }, req.query.slug, req.query.ep, req.query.sv));
    }
};
