const {
    checkRateLimit,
    isSameOriginRequest,
    setSecurityHeaders,
    setSecurityLockCookie
} = require('./_security');

module.exports = async (req, res) => {
    setSecurityHeaders(res, {
        cacheControl: 'private, no-store',
        csp: "default-src 'none'; frame-ancestors 'none'; object-src 'none'"
    });

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'POST, OPTIONS');
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isSameOriginRequest(req)) {
        return res.status(403).json({ error: 'Cross-origin security signal is blocked' });
    }

    const rateLimit = checkRateLimit(req, { prefix: 'security-lock', limit: 120 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        return res.status(429).json({ error: 'Too many requests' });
    }

    const lock = setSecurityLockCookie(req, res, {
        reason: req.query?.reason || req.headers['x-qc-security-signal'] || 'client-signal'
    });

    res.setHeader('X-QC-Security-Lock-Until', String(lock.expiresAt));
    return res.status(204).end();
};
