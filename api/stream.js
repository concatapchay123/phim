const {
    checkRateLimit,
    getSecurityLockRetryAfter,
    isSameOriginRequest,
    isSecurityLockedRequest,
    rewriteM3u8Playlist,
    setSecurityHeaders,
    verifySignedToken
} = require('./_security');

module.exports = async (req, res) => {
    setSecurityHeaders(res, {
        cacheControl: 'private, no-store',
        crossOriginResourcePolicy: 'same-origin',
        referrerPolicy: 'no-referrer'
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
        return res.status(403).send('Cross-origin stream access is blocked');
    }

    if (isSecurityLockedRequest(req)) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        return res.status(423).send('Security lock is active');
    }

    const rateLimit = checkRateLimit(req, { prefix: 'stream', limit: 900 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        return res.status(429).send('Too many requests');
    }

    try {
        const targetUrl = verifySignedToken(req.query.t);
        const upstream = await fetch(targetUrl, {
            headers: {
                Accept: '*/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!upstream.ok) {
            return res.status(upstream.status).send('Stream source is unavailable');
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        const isPlaylist = contentType.includes('mpegurl') || /\.m3u8(\?|#|$)/i.test(targetUrl);

        res.setHeader('Accept-Ranges', 'bytes');

        if (isPlaylist) {
            const playlist = await upstream.text();
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
            res.setHeader('Cache-Control', 'private, max-age=15');
            if (req.method === 'HEAD') return res.status(200).end();
            return res.status(200).send(rewriteM3u8Playlist(playlist, targetUrl));
        }

        const arrayBuffer = await upstream.arrayBuffer();
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'private, max-age=30');

        if (req.method === 'HEAD') return res.status(200).end();
        return res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error('Stream proxy error:', error.message);
        return res.status(error.statusCode || 500).send('Stream proxy error');
    }
};
