const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const {
    buildClientApiUrl,
    buildUpstreamApiUrl,
    checkRateLimit,
    getSecurityLockRetryAfter,
    isSameOriginRequest,
    isSecurityLockedRequest,
    renderPlayerHtml,
    resolveImageTarget,
    resolveEpisodeSource,
    rewriteM3u8Playlist,
    sanitizeUpstreamData,
    setSecurityLockCookie,
    setSecurityHeaders,
    verifySignedToken
} = require('./api/_security');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

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

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.avif': 'image/avif'
};

const PRIVATE_STATIC_PATHS = new Set([
    '/.gitignore',
    '/.vercelignore',
    '/api_document.md',
    '/build.bat',
    '/design.md',
    '/detail.json',
    '/fix-refs.js',
    '/product.md',
    '/server.js',
    '/vercel.json'
]);

const STATIC_CSP = [
    "default-src 'self'",
    "base-uri 'self'",
    "script-src 'self' https://unpkg.com https://cdnjs.cloudflare.com 'unsafe-inline'",
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' https: data:",
    "connect-src 'self'",
    "frame-src 'self' https:",
    "media-src 'self' blob:",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'"
].join('; ');

const PLAYER_CSP = [
    "default-src 'none'",
    "base-uri 'none'",
    "frame-src https:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'unsafe-inline'",
    "img-src data: https:",
    "form-action 'none'",
    "frame-ancestors 'self'",
    "object-src 'none'"
].join('; ');

const server = http.createServer(async (req, res) => {
    try {
        const parsedUrl = url.parse(req.url, true);
        let pathname = parsedUrl.pathname || '/';

        if (pathname === '/api/security-lock') {
            await handleSecurityLock(req, res, parsedUrl.query);
            return;
        }

        if (pathname === '/api/c') {
            await handleClientApi(req, res, parsedUrl.query);
            return;
        }

        if (pathname === '/api/proxy') {
            await handleApiProxy(req, res, parsedUrl.query.url, parsedUrl.query, 'proxy');
            return;
        }

        if (pathname === '/api/player') {
            await handlePlayer(req, res, parsedUrl.query);
            return;
        }

        if (pathname === '/api/stream') {
            await handleStream(req, res, parsedUrl.query);
            return;
        }

        if (pathname === '/api/i') {
            await handleImage(req, res, parsedUrl.query);
            return;
        }

        if (pathname.startsWith('/api/')) {
            const upstreamPath = pathname.replace(/^\/api/, '');
            await handleApiProxy(req, res, upstreamPath, parsedUrl.query, 'api');
            return;
        }

        serveStaticFile(req, res, pathname);
    } catch (error) {
        console.error('Server error:', error.message);
        if (!res.headersSent) {
            sendText(res, 500, 'Internal server error');
        } else {
            res.end();
        }
    }
});

async function handleSecurityLock(req, res, query = {}) {
    setSecurityHeaders(res, {
        cacheControl: 'private, no-store',
        csp: "default-src 'none'; frame-ancestors 'none'; object-src 'none'"
    });

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'POST, OPTIONS');
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        sendJson(res, 405, { error: 'Method not allowed' });
        return;
    }

    if (!isSameOriginRequest(req)) {
        sendJson(res, 403, { error: 'Cross-origin security signal is blocked' });
        return;
    }

    const rateLimit = checkRateLimit(req, { prefix: 'security-lock', limit: 120 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        sendJson(res, 429, { error: 'Too many requests' });
        return;
    }

    const lock = setSecurityLockCookie(req, res, {
        reason: query.reason || req.headers['x-qc-security-signal'] || 'client-signal'
    });
    res.setHeader('X-QC-Security-Lock-Until', String(lock.expiresAt));
    res.writeHead(204);
    res.end();
}

async function handleApiProxy(req, res, apiPath, params, prefix) {
    setSecurityHeaders(res, {
        cacheControl: 's-maxage=300, stale-while-revalidate=60'
    });

    if (process.env.ENABLE_LEGACY_PROXY !== 'true') {
        sendJson(res, 404, { error: 'Endpoint disabled' });
        return;
    }

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'GET, OPTIONS');
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET, OPTIONS');
        sendJson(res, 405, { error: 'Method not allowed' });
        return;
    }

    if (!isSameOriginRequest(req)) {
        sendJson(res, 403, { error: 'Cross-origin API access is blocked' });
        return;
    }

    if (isSecurityLockedRequest(req)) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        sendJson(res, 423, { error: 'Security lock is active' });
        return;
    }

    const rateLimit = checkRateLimit(req, { prefix, limit: 160 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        sendJson(res, 429, { error: 'Too many requests' });
        return;
    }

    try {
        const targetUrl = buildUpstreamApiUrl(apiPath, params);
        const response = await fetch(targetUrl.toString(), {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            sendJson(res, response.status, { error: `Upstream error: ${response.status}` });
            return;
        }

        const data = await response.json();
        sendJson(res, 200, sanitizeUpstreamData(data));
    } catch (error) {
        console.error('Proxy request error:', error.message);
        sendJson(res, error.statusCode || 500, { error: 'Internal proxy error' });
    }
}

async function handleClientApi(req, res, query) {
    setSecurityHeaders(res, {
        cacheControl: getClientCacheControl(query.q || query.kind)
    });

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'GET, OPTIONS');
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET, OPTIONS');
        sendJson(res, 405, { error: 'Method not allowed' });
        return;
    }

    if (!isSameOriginRequest(req)) {
        sendJson(res, 403, { error: 'Cross-origin API access is blocked' });
        return;
    }

    if (isSecurityLockedRequest(req)) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        sendJson(res, 423, { error: 'Security lock is active' });
        return;
    }

    const rateLimit = checkRateLimit(req, { prefix: 'client', limit: 160 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        sendJson(res, 429, { error: 'Too many requests' });
        return;
    }

    try {
        const targetUrl = buildClientApiUrl(query.q || query.kind, query);
        const response = await fetch(targetUrl.toString(), {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            sendJson(res, response.status, { error: `Upstream error: ${response.status}` });
            return;
        }

        const data = await response.json();
        sendJson(res, 200, sanitizeUpstreamData(data));
    } catch (error) {
        console.error('Client API error:', error.message);
        sendJson(res, error.statusCode || 500, { error: 'Internal API error' });
    }
}

async function handlePlayer(req, res, query) {
    setSecurityHeaders(res, {
        allowFrameAncestors: true,
        cacheControl: 'private, no-store',
        crossOriginResourcePolicy: 'same-origin',
        referrerPolicy: 'no-referrer',
        csp: PLAYER_CSP
    });

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'GET, OPTIONS');
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET, OPTIONS');
        sendText(res, 405, 'Method not allowed');
        return;
    }

    if (!isSameOriginRequest(req)) {
        sendText(res, 403, 'Cross-origin player access is blocked');
        return;
    }

    if (isSecurityLockedRequest(req)) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        sendText(res, 423, 'Security lock is active');
        return;
    }

    const rateLimit = checkRateLimit(req, { prefix: 'player', limit: 90 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        sendText(res, 429, 'Too many requests');
        return;
    }

    try {
        const source = await resolveEpisodeSource(fetch, {
            slug: query.slug,
            episodeIndex: query.ep,
            serverIndex: query.sv
        });

        sendHtml(res, 200, renderPlayerHtml(source, query.slug, query.ep, query.sv));
    } catch (error) {
        console.error('Player resolve error:', error.message);
        sendText(res, error.statusCode || 500, 'Player source is unavailable');
    }
}

async function handleStream(req, res, query) {
    setSecurityHeaders(res, {
        cacheControl: 'private, no-store',
        crossOriginResourcePolicy: 'same-origin',
        referrerPolicy: 'no-referrer'
    });

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'GET, HEAD, OPTIONS');
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD, OPTIONS');
        sendText(res, 405, 'Method not allowed');
        return;
    }

    if (!isSameOriginRequest(req)) {
        sendText(res, 403, 'Cross-origin stream access is blocked');
        return;
    }

    if (isSecurityLockedRequest(req)) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        sendText(res, 423, 'Security lock is active');
        return;
    }

    const rateLimit = checkRateLimit(req, { prefix: 'stream', limit: 900 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        sendText(res, 429, 'Too many requests');
        return;
    }

    try {
        const targetUrl = verifySignedToken(query.t);
        const upstream = await fetch(targetUrl, {
            headers: {
                Accept: '*/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!upstream.ok) {
            sendText(res, upstream.status, 'Stream source is unavailable');
            return;
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        const isPlaylist = contentType.includes('mpegurl') || /\.m3u8(\?|#|$)/i.test(targetUrl);

        res.setHeader('Accept-Ranges', 'bytes');

        if (isPlaylist) {
            const playlist = await upstream.text();
            res.setHeader('Cache-Control', 'private, max-age=15');
            if (req.method === 'HEAD') {
                res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8' });
                res.end();
                return;
            }
            sendText(res, 200, rewriteM3u8Playlist(playlist, targetUrl), 'application/vnd.apple.mpegurl; charset=utf-8');
            return;
        }

        const arrayBuffer = await upstream.arrayBuffer();
        res.setHeader('Cache-Control', 'private, max-age=30');
        if (req.method === 'HEAD') {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end();
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error('Stream proxy error:', error.message);
        sendText(res, error.statusCode || 500, 'Stream proxy error');
    }
}

async function handleImage(req, res, query) {
    setSecurityHeaders(res, {
        cacheControl: 'private, max-age=86400',
        crossOriginResourcePolicy: 'same-origin',
        referrerPolicy: 'no-referrer',
        csp: "default-src 'none'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none'"
    });

    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'GET, HEAD, OPTIONS');
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD, OPTIONS');
        sendText(res, 405, 'Method not allowed');
        return;
    }

    if (!isSameOriginRequest(req)) {
        sendText(res, 403, 'Cross-origin image access is blocked');
        return;
    }

    if (isSecurityLockedRequest(req)) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
        sendText(res, 423, 'Security lock is active');
        return;
    }

    const rateLimit = checkRateLimit(req, { prefix: 'image', limit: 1200 });
    if (!rateLimit.ok) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter));
        sendText(res, 429, 'Too many requests');
        return;
    }

    try {
        const targetUrl = resolveImageTarget(query);
        const upstream = await fetch(targetUrl, {
            headers: {
                Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!upstream.ok) {
            sendText(res, upstream.status, 'Image source is unavailable');
            return;
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        if (!contentType.startsWith('image/')) {
            sendText(res, 415, 'Unsupported media type');
            return;
        }

        res.setHeader('Cache-Control', 'private, max-age=86400');
        if (req.method === 'HEAD') {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end();
            return;
        }

        const arrayBuffer = await upstream.arrayBuffer();
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error('Image proxy error:', error.message);
        sendText(res, error.statusCode || 500, 'Image proxy error');
    }
}

function serveStaticFile(req, res, pathname) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        sendText(res, 405, 'Method not allowed');
        return;
    }

    let normalizedPathname = pathname;
    try {
        normalizedPathname = decodeURIComponent(pathname);
    } catch (error) {
        sendText(res, 400, 'Bad request');
        return;
    }

    normalizedPathname = normalizedPathname.replace(/\\/g, '/').toLowerCase();
    if (
        normalizedPathname.startsWith('/.git') ||
        normalizedPathname.startsWith('/.vercel') ||
        normalizedPathname.endsWith('.map') ||
        PRIVATE_STATIC_PATHS.has(normalizedPathname)
    ) {
        sendText(res, 404, 'File not found');
        return;
    }

    const isLockPageRequest = normalizedPathname === '/security-locked' ||
        normalizedPathname === '/security-locked.html' ||
        normalizedPathname === '/security-locked.min.html';
    const lockedStaticExt = path.extname(normalizedPathname);

    if (isSecurityLockedRequest(req) && !isLockPageRequest) {
        if (lockedStaticExt === '.js' || lockedStaticExt === '.css' || lockedStaticExt === '.map') {
            res.setHeader('Cache-Control', 'private, no-store');
            res.setHeader('Retry-After', String(getSecurityLockRetryAfter(req)));
            sendText(res, 423, 'Security lock is active');
            return;
        }

        if (!lockedStaticExt || lockedStaticExt === '.html') {
            pathname = '/security-locked.min.html';
        }
    }

    if (pathname === '/' || pathname === '/index.html') {
        pathname = '/index.min.html';
    } else if (pathname === '/app.js') {
        pathname = '/app.min.js';
    } else if (pathname === '/style.css') {
        pathname = '/style.min.css';
    } else if (/\.html$/i.test(pathname) && !/\.min\.html$/i.test(pathname)) {
        const minHtmlPath = path.resolve(ROOT_DIR, `.${pathname.replace(/\.html$/i, '.min.html')}`);
        if (minHtmlPath.startsWith(`${ROOT_DIR}${path.sep}`) && fs.existsSync(minHtmlPath)) {
            pathname = pathname.replace(/\.html$/i, '.min.html');
        }
    } else if (!path.extname(pathname)) {
        const minHtmlPath = path.resolve(ROOT_DIR, `.${pathname}.min.html`);
        const htmlPath = path.resolve(ROOT_DIR, `.${pathname}.html`);
        if (minHtmlPath.startsWith(`${ROOT_DIR}${path.sep}`) && fs.existsSync(minHtmlPath)) {
            pathname += '.min.html';
        } else if (htmlPath.startsWith(`${ROOT_DIR}${path.sep}`) && fs.existsSync(htmlPath)) {
            pathname += '.html';
        }
    }

    const filePath = path.resolve(ROOT_DIR, `.${pathname}`);

    if (!(filePath === ROOT_DIR || filePath.startsWith(`${ROOT_DIR}${path.sep}`))) {
        sendText(res, 403, 'Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            sendText(res, 404, 'File not found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const isResolvedLockPage = path.basename(filePath).toLowerCase() === 'security-locked.min.html';

        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'same-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=()');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        res.setHeader(
            'Content-Security-Policy',
            isResolvedLockPage
                ? "default-src 'none'; base-uri 'none'; style-src 'unsafe-inline'; form-action 'none'; frame-ancestors 'none'; object-src 'none'"
                : STATIC_CSP
        );
        if (isResolvedLockPage) {
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('Referrer-Policy', 'no-referrer');
        }
        res.setHeader('Cache-Control', ext === '.html' || ext === '.js' || ext === '.css' ? 'no-store, max-age=0' : 'public, max-age=86400');
        res.writeHead(200, { 'Content-Type': contentType });

        if (req.method === 'HEAD') {
            res.end();
            return;
        }

        fs.createReadStream(filePath).pipe(res);
    });
}

function sendJson(res, statusCode, body) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}

function sendHtml(res, statusCode, body) {
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
}

function sendText(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.end(body);
}

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error('==================================================');
        console.error(`   KHONG KHOI DONG DUOC: cong ${PORT} dang duoc su dung`);
        console.error(`   Co the server da chay san tai: http://localhost:${PORT}`);
        console.error('   Hay dong cua so server cu hoac chay lai file run-local.bat');
        console.error('==================================================');
        process.exit(1);
        return;
    }

    console.error('Server failed to start:', error);
    process.exit(1);
});

server.listen(PORT, () => {
    console.log('==================================================');
    console.log('   QUAN CHILL DEV SERVER RUNNING LOCALLY');
    console.log(`   URL: http://localhost:${PORT}`);
    console.log('   Press Ctrl+C to stop the server');
    console.log('==================================================');
});
