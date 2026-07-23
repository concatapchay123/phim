const crypto = require('crypto');
const { PROVIDERS, resolveMovie } = require('./_providers');

const API_BASE_URL = (process.env.KKPHIM_API_BASE_URL || 'https://phimapi.com').replace(/\/+$/, '');
const KKPHIM_IMAGE_BASE_URL = (process.env.KKPHIM_IMAGE_BASE_URL || 'https://phimimg.com/').replace(/\/?$/, '/');
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const LOCAL_PLAYER_TOKEN_SECRET = 'quanchill-local-player-secret-change-me';
const LOCAL_SECURITY_LOCK_SECRET = 'quanchill-local-security-lock-secret-change-me';
const PLAYER_TOKEN_SECRET = process.env.PLAYER_TOKEN_SECRET || (IS_PRODUCTION ? '' : LOCAL_PLAYER_TOKEN_SECRET);
const PLAYER_TOKEN_TTL_SECONDS = Math.max(30, Number(process.env.PLAYER_TOKEN_TTL_SECONDS || 300));
// Third-party embed players can expose their own branding, diagnostics and
// source URLs. Keep them disabled by default; enabling this is an explicit
// compatibility trade-off, not a security feature.
const ALLOW_EXTERNAL_EMBED_FALLBACK = process.env.ALLOW_EXTERNAL_EMBED_FALLBACK === 'true';
const HLS_VALIDATION_TIMEOUT_MS = Math.max(800, Number(process.env.HLS_VALIDATION_TIMEOUT_MS || 2200));
// API responses may be kept in the browser cache for up to 15 days.  Keep image
// links valid longer than that window so a cached catalogue never contains
// already-expired image URLs.
const IMAGE_TOKEN_TTL_SECONDS = Math.max(2592000, Number(process.env.IMAGE_TOKEN_TTL_SECONDS || 2592000));
const ENABLE_STREAM_PROXY = process.env.ENABLE_STREAM_PROXY === 'true' && process.env.ALLOW_HIGH_BANDWIDTH_STREAM_PROXY === 'true';
const ENABLE_IMAGE_PROXY = process.env.ENABLE_IMAGE_PROXY === 'true' && process.env.ALLOW_HIGH_BANDWIDTH_IMAGE_PROXY === 'true';
const SECURITY_LOCK_SECRET = process.env.SECURITY_LOCK_SECRET || (IS_PRODUCTION ? '' : LOCAL_SECURITY_LOCK_SECRET);
const SECURITY_LOCK_COOKIE_NAME = 'qc_security_lock';
const SECURITY_LOCK_SECONDS = Math.min(300, Math.max(5, Number(process.env.SECURITY_LOCK_SECONDS || 20)));
const PLAYER_UNAVAILABLE_MESSAGE = 'Phim hiện đang được cập nhật';

const QUERY_ALLOWLIST = new Set([
    'page',
    'limit',
    'keyword',
    'sort_field',
    'sort_type',
    'sort_lang',
    'category',
    'country',
    'year'
]);

const API_PATH_ALLOWLIST = [
    /^\/v1\/api\/home$/,
    /^\/v1\/api\/danh-sach\/[a-z0-9-]+$/,
    /^\/v1\/api\/tim-kiem$/,
    /^\/v1\/api\/phim\/[a-z0-9-]+$/,
    /^\/v1\/api\/phim\/[a-z0-9-]+\/images$/,
    /^\/v1\/api\/the-loai$/,
    /^\/v1\/api\/the-loai\/[a-z0-9-]+$/,
    /^\/v1\/api\/quoc-gia$/,
    /^\/v1\/api\/quoc-gia\/[a-z0-9-]+$/,
    /^\/nam-phat-hanh$/,
    /^\/v1\/api\/phim\/[a-z0-9-]+\/(peoples|keywords)$/
];

const CLIENT_KIND_MAP = {
    a: '/v1/api/home',
    b: '/v1/api/danh-sach/phim-bo',
    c: '/v1/api/danh-sach/phim-le',
    d: '/v1/api/danh-sach/phim-chieu-rap',
    e: '/v1/api/tim-kiem',
    j: '/v1/api/the-loai',
    k: '/v1/api/quoc-gia',
    l: '/nam-phat-hanh'
};

const SENSITIVE_VIDEO_KEYS = new Set([
    'link_embed',
    'link_m3u8',
    'link_iframe',
    'link_video',
    'embed_url',
    'video_url',
    'm3u8',
    'source'
]);

const IMAGE_KEYS = new Set(['poster_url', 'thumb_url', 'file_path', 'image']);
const IMAGE_HOST_ALLOWLIST = new Set([
    'image.tmdb.org',
    'phimapi.com',
    'www.phimapi.com',
    'phimimg.com',
    'www.phimimg.com',
    'via.placeholder.com'
]);

function assertSecurityConfiguration() {
    if (!IS_PRODUCTION) return;

    const invalidSecrets = [
        ['PLAYER_TOKEN_SECRET', PLAYER_TOKEN_SECRET],
        ['SECURITY_LOCK_SECRET', SECURITY_LOCK_SECRET]
    ].filter(([, value]) => String(value || '').length < 32)
        .map(([name]) => name);

    if (invalidSecrets.length > 0 || safeEqualString(PLAYER_TOKEN_SECRET, SECURITY_LOCK_SECRET)) {
        throw createHttpError('Service security configuration is incomplete', 503);
    }
}

const rateBuckets = new Map();

function createHttpError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getSecurityLockSigningKey() {
    return crypto.createHash('sha256').update(SECURITY_LOCK_SECRET).digest();
}

function signSecurityLockPayload(encodedPayload) {
    return crypto
        .createHmac('sha256', getSecurityLockSigningKey())
        .update(`security-lock:${encodedPayload}`)
        .digest('base64url');
}

function safeEqualString(left, right) {
    const leftBuffer = Buffer.from(String(left || ''));
    const rightBuffer = Buffer.from(String(right || ''));
    return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookieHeader(req) {
    return String(req.headers?.cookie || '').split(';').reduce((cookies, part) => {
        const separatorIndex = part.indexOf('=');
        if (separatorIndex === -1) return cookies;
        const key = part.slice(0, separatorIndex).trim();
        const value = part.slice(separatorIndex + 1).trim();
        if (key) cookies[key] = value;
        return cookies;
    }, {});
}

function isSecureRequest(req) {
    const protoHeader = req.headers?.['x-forwarded-proto'];
    const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;
    return proto === 'https' || Boolean(req.socket?.encrypted || req.connection?.encrypted);
}

function appendSetCookie(res, cookieValue) {
    const existing = typeof res.getHeader === 'function' ? res.getHeader('Set-Cookie') : undefined;
    if (!existing) {
        res.setHeader('Set-Cookie', cookieValue);
    } else if (Array.isArray(existing)) {
        res.setHeader('Set-Cookie', [...existing, cookieValue]);
    } else {
        res.setHeader('Set-Cookie', [existing, cookieValue]);
    }
}

function createSecurityLockValue(options = {}) {
    const ttlSeconds = Math.min(300, Math.max(5, Number(options.seconds || SECURITY_LOCK_SECONDS)));
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const reason = String(options.reason || 'client-signal').replace(/[^\w.-]/g, '').slice(0, 48) || 'client-signal';
    const payload = Buffer.from(JSON.stringify({
        exp: expiresAt,
        iat: Date.now(),
        r: reason,
        n: crypto.randomBytes(8).toString('base64url')
    }), 'utf8').toString('base64url');

    return {
        value: `${payload}.${signSecurityLockPayload(payload)}`,
        expiresAt,
        ttlSeconds
    };
}

function readSecurityLock(req) {
    const cookieValue = parseCookieHeader(req)[SECURITY_LOCK_COOKIE_NAME];
    const [payload, signature] = String(cookieValue || '').split('.');
    if (!payload || !signature || !safeEqualString(signature, signSecurityLockPayload(payload))) {
        return null;
    }

    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!Number.isFinite(Number(data.exp)) || Date.now() > Number(data.exp)) return null;
        return data;
    } catch (error) {
        return null;
    }
}

function setSecurityLockCookie(req, res, options = {}) {
    assertSecurityConfiguration();
    const lock = createSecurityLockValue(options);
    const cookieParts = [
        `${SECURITY_LOCK_COOKIE_NAME}=${lock.value}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        `Max-Age=${lock.ttlSeconds}`
    ];

    if (isSecureRequest(req)) cookieParts.push('Secure');
    appendSetCookie(res, cookieParts.join('; '));
    return lock;
}

function isSecurityLockedRequest(req) {
    return Boolean(readSecurityLock(req));
}

function getSecurityLockRetryAfter(req) {
    const lock = readSecurityLock(req);
    if (!lock) return 0;
    return Math.max(1, Math.ceil((Number(lock.exp) - Date.now()) / 1000));
}

function normalizeApiPath(apiPath) {
    let rawPath = Array.isArray(apiPath) ? apiPath.join('/') : String(apiPath || '');
    rawPath = rawPath.trim();

    if (!rawPath) {
        throw createHttpError('Missing API path', 400);
    }

    if (/^https?:\/\//i.test(rawPath) || rawPath.startsWith('//')) {
        throw createHttpError('Absolute upstream URLs are not allowed', 403);
    }

    rawPath = rawPath.split('?')[0].replace(/\\/g, '/');
    if (!rawPath.startsWith('/')) rawPath = `/${rawPath}`;

    try {
        rawPath = decodeURI(rawPath);
    } catch (error) {
        throw createHttpError('Invalid API path encoding', 400);
    }

    rawPath = rawPath.replace(/\/{2,}/g, '/');

    if (rawPath.includes('..') || /[\x00-\x1f<>]/.test(rawPath)) {
        throw createHttpError('Unsafe API path', 403);
    }

    if (!/^\/[a-zA-Z0-9._~/-]+$/.test(rawPath)) {
        throw createHttpError('Invalid API path', 400);
    }

    if (!API_PATH_ALLOWLIST.some(pattern => pattern.test(rawPath))) {
        throw createHttpError('API path is not allowed', 403);
    }

    return rawPath;
}

function normalizeSlug(value) {
    const slug = String(value || '').trim().toLowerCase();
    if (!/^[a-z0-9-]{1,160}$/.test(slug)) {
        throw createHttpError('Invalid movie slug', 400);
    }
    return slug;
}

function normalizeIndex(value, fallback = 0) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return fallback;
    return Math.min(parsed, 5000);
}

function appendSafeQuery(searchParams, params = {}) {
    Object.keys(params).forEach(key => {
        if (key === 'url' || key === 'path' || !QUERY_ALLOWLIST.has(key)) return;

        const rawValue = Array.isArray(params[key]) ? params[key][0] : params[key];
        if (rawValue === undefined || rawValue === null || rawValue === '') return;

        let value = String(rawValue).trim();

        if (key === 'page') {
            value = String(clampInteger(value, 1, 1000, 1));
        } else if (key === 'limit') {
            value = String(clampInteger(value, 1, 48, 24));
        } else if (key === 'year') {
            value = /^\d{4}$/.test(value) ? value : '';
        } else if (key === 'keyword') {
            value = value.slice(0, 80);
        } else {
            value = value.slice(0, 80);
            if (!/^[\w.\- ]+$/u.test(value)) value = '';
        }

        if (value) searchParams.set(key, value);
    });
}

function clampInteger(value, min, max, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return fallback;
    return String(Math.min(Math.max(parsed, min), max));
}

function buildUpstreamApiUrl(apiPath, params = {}) {
    const safePath = normalizeApiPath(apiPath);
    const targetUrl = new URL(`${API_BASE_URL}${safePath}`);
    appendSafeQuery(targetUrl.searchParams, params);
    return targetUrl;
}

function buildClientApiUrl(kindValue, params = {}) {
    const kind = String(kindValue || '').trim();
    let apiPath = CLIENT_KIND_MAP[kind];
    const slug = params.s || params.slug;

    if (kind === 'f') {
        apiPath = `/v1/api/phim/${normalizeSlug(slug)}`;
    } else if (kind === 'g') {
        apiPath = `/v1/api/phim/${normalizeSlug(slug)}/images`;
    } else if (kind === 'm') {
        apiPath = `/v1/api/phim/${normalizeSlug(slug)}/peoples`;
    } else if (kind === 'n') {
        apiPath = `/v1/api/phim/${normalizeSlug(slug)}/keywords`;
    } else if (kind === 'h') {
        apiPath = `/v1/api/the-loai/${normalizeSlug(slug)}`;
    } else if (kind === 'i') {
        apiPath = `/v1/api/quoc-gia/${normalizeSlug(slug)}`;
    }

    if (!apiPath) {
        throw createHttpError('Unknown API kind', 403);
    }

    const forwardedParams = { ...params };
    delete forwardedParams.kind;
    delete forwardedParams.q;
    delete forwardedParams.slug;
    delete forwardedParams.s;

    return buildUpstreamApiUrl(apiPath, forwardedParams);
}

function sanitizeUpstreamData(value, seen = new WeakSet()) {
    if (typeof value === 'string') return sanitizeStringValue(value);
    if (!value || typeof value !== 'object') return value;
    if (seen.has(value)) return null;
    seen.add(value);

    if (Array.isArray(value)) {
        return value.map(item => sanitizeUpstreamData(item, seen));
    }

    return Object.keys(value).reduce((safe, key) => {
        if (SENSITIVE_VIDEO_KEYS.has(key)) return safe;
        if (typeof value[key] === 'string') {
            if (IMAGE_KEYS.has(key)) {
                safe[key] = createImageProxyPath(value[key], key);
            } else {
                safe[key] = sanitizeStringValue(value[key]);
            }
            return safe;
        }
        safe[key] = sanitizeUpstreamData(value[key], seen);
        return safe;
    }, {});
}

function sanitizeStringValue(value) {
    const text = String(value || '');
    if (/^https?:\/\//i.test(text)) return '';
    if (/(^|[.\-/])phimapi(?:[.\-/]|$)/i.test(text)) return '';
    return text;
}

function createImageProxyPath(src, sourceKey = '') {
    try {
        const targetUrl = normalizeImageUrl(src, sourceKey);
        if (!ENABLE_IMAGE_PROXY) return targetUrl.toString();
        return `/api/i?t=${encodeURIComponent(createSignedToken(targetUrl, IMAGE_TOKEN_TTL_SECONDS, 'image'))}`;
    } catch (error) {
        return '';
    }
}

function normalizeImageUrl(src, sourceKey = '') {
    let rawValue = String(src || '').trim();
    if (!rawValue) {
        throw createHttpError('Missing image source', 400);
    }

    if (rawValue.startsWith('//')) rawValue = `https:${rawValue}`;

    let targetUrl;
    if (/^https?:\/\//i.test(rawValue)) {
        targetUrl = new URL(rawValue);
    } else if (rawValue.startsWith('/') && sourceKey === 'file_path') {
        targetUrl = new URL(`https://image.tmdb.org/t/p/original${rawValue}`);
    } else {
        targetUrl = new URL(rawValue.replace(/^\/+/, ''), KKPHIM_IMAGE_BASE_URL);
    }

    if (!IMAGE_HOST_ALLOWLIST.has(targetUrl.hostname)) {
        throw createHttpError('Image host is not allowed', 403);
    }

    return targetUrl.toString();
}

function resolveImageTarget(query = {}) {
    return verifySignedToken(query.t, 'image');
}

function getClientIp(req) {
    const forwardedFor = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'];
    if (process.env.VERCEL === '1' && typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0].trim().slice(0, 128);
    }
    return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

function checkRateLimit(req, options = {}) {
    const limit = options.limit || 180;
    const windowMs = options.windowMs || 60 * 1000;
    const key = `${options.prefix || 'api'}:${getClientIp(req)}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
        bucket.count = 0;
        bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    rateBuckets.set(key, bucket);

    if (bucket.count > limit) {
        return {
            ok: false,
            retryAfter: Math.ceil((bucket.resetAt - now) / 1000)
        };
    }

    if (rateBuckets.size > 5000) {
        for (const [bucketKey, value] of rateBuckets.entries()) {
            if (now > value.resetAt) rateBuckets.delete(bucketKey);
        }
    }

    return { ok: true };
}

function getRequestOrigin(req) {
    const protoHeader = req.headers['x-forwarded-proto'];
    const proto = Array.isArray(protoHeader) ? protoHeader[0] : (protoHeader || 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return host ? `${proto}://${host}` : '';
}

function isSameOriginRequest(req) {
    const expectedOrigin = getRequestOrigin(req);
    const origin = req.headers.origin;
    const referer = req.headers.referer || req.headers.referrer;
    const fetchSite = String(req.headers['sec-fetch-site'] || '').toLowerCase();

    // Iframe navigations can legitimately omit Origin and Referer when the
    // page uses a strict referrer policy.  Browsers still attach the
    // unforgeable Sec-Fetch-Site header for a same-origin navigation.
    if (!expectedOrigin) return false;
    if (!origin && !referer && fetchSite !== 'same-origin') return false;

    if (origin && expectedOrigin && origin !== expectedOrigin) return false;

    if (referer && expectedOrigin) {
        try {
            return new URL(referer).origin === expectedOrigin;
        } catch (error) {
            return false;
        }
    }

    if (fetchSite && fetchSite !== 'same-origin') return false;

    return true;
}

function setSecurityHeaders(res, options = {}) {
    const frameAncestors = options.allowFrameAncestors ? "'self'" : "'none'";
    const csp = options.csp || [
        "default-src 'none'",
        "base-uri 'none'",
        `frame-ancestors ${frameAncestors}`,
        "object-src 'none'"
    ].join('; ');

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', options.referrerPolicy || 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=()');
    res.setHeader('Cross-Origin-Resource-Policy', options.crossOriginResourcePolicy || 'same-origin');
    res.setHeader('Content-Security-Policy', csp);

    if (!options.allowFrameAncestors) {
        res.setHeader('X-Frame-Options', 'DENY');
    }

    if (options.cacheControl) {
        res.setHeader('Cache-Control', options.cacheControl);
    }
}

function createSignedToken(url, ttlSeconds = PLAYER_TOKEN_TTL_SECONDS, purpose = 'stream') {
    assertSecurityConfiguration();
    const targetUrl = assertSafeProxyTarget(url, purpose);
    const payload = Buffer.from(JSON.stringify({
        u: targetUrl,
        p: purpose,
        exp: Date.now() + ttlSeconds * 1000
    }), 'utf8');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getTokenCipherKey(), iv);
    const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64url')}.${encrypted.toString('base64url')}.${tag.toString('base64url')}`;
}

function verifySignedToken(token, expectedPurpose = 'stream') {
    assertSecurityConfiguration();
    const [ivPart, encryptedPart, tagPart] = String(token || '').split('.');
    if (!ivPart || !encryptedPart || !tagPart) {
        throw createHttpError('Missing signed token', 401);
    }

    let data;
    try {
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            getTokenCipherKey(),
            Buffer.from(ivPart, 'base64url')
        );
        decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedPart, 'base64url')),
            decipher.final()
        ]);
        data = JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
        throw createHttpError('Invalid signed token', 401);
    }

    if (!data.u || data.p !== expectedPurpose) {
        throw createHttpError('Invalid stream target', 401);
    }

    if (!data.exp || Date.now() > data.exp) {
        throw createHttpError('Expired signed token', 401);
    }

    return assertSafeProxyTarget(data.u, expectedPurpose);
}

function assertSafeProxyTarget(urlValue, purpose) {
    let targetUrl;
    try {
        targetUrl = new URL(String(urlValue || ''));
    } catch (error) {
        throw createHttpError('Invalid proxy target', 401);
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol) || targetUrl.username || targetUrl.password) {
        throw createHttpError('Invalid proxy target', 401);
    }

    const hostname = targetUrl.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || isPrivateIpAddress(hostname)) {
        throw createHttpError('Unsafe proxy target', 403);
    }

    if (purpose === 'image' && !IMAGE_HOST_ALLOWLIST.has(hostname)) {
        throw createHttpError('Image host is not allowed', 403);
    }

    return targetUrl.toString();
}

function isPrivateIpAddress(hostname) {
    if (hostname === '::1' || hostname === '[::1]' || hostname.startsWith('fc') || hostname.startsWith('fd')) return true;
    const octets = hostname.split('.').map(part => Number.parseInt(part, 10));
    if (octets.length !== 4 || octets.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return false;
    return octets[0] === 10 ||
        octets[0] === 127 ||
        octets[0] === 0 ||
        (octets[0] === 169 && octets[1] === 254) ||
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
        (octets[0] === 192 && octets[1] === 168);
}

function getTokenCipherKey() {
    return crypto.createHash('sha256').update(PLAYER_TOKEN_SECRET).digest();
}

function isHlsUrl(urlValue = '') {
    try {
        return /\.m3u8(\?|#|$)/i.test(new URL(urlValue).pathname + new URL(urlValue).search);
    } catch (error) {
        return /\.m3u8(\?|#|$)/i.test(String(urlValue));
    }
}

function absolutizeUrl(urlValue, baseUrl) {
    return new URL(urlValue, baseUrl).toString();
}

function isAbsoluteHttpUrl(urlValue = '') {
    return /^https?:\/\//i.test(String(urlValue || '').trim());
}

function rewriteM3u8Playlist(playlistText, playlistUrl) {
    const makeStreamUrl = target => `/api/stream?t=${encodeURIComponent(createSignedToken(absolutizeUrl(target, playlistUrl), PLAYER_TOKEN_TTL_SECONDS, 'stream'))}`;

    return String(playlistText).split(/\r?\n/).map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        if (trimmed.startsWith('#')) {
            return line.replace(/URI="([^"]+)"/g, (_match, uri) => `URI="${makeStreamUrl(uri)}"`);
        }

        return makeStreamUrl(trimmed);
    }).join('\n');
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function escapeAttr(value = '') {
    return escapeHtml(value).replace(/`/g, '&#096;');
}

function createEpisodeSourceCandidate(episode, episodeIndex, serverIndex, provider = 'kkphim') {
    if (!episode) return null;

    const hlsUrl = String(episode.link_m3u8 || episode.m3u8 || episode.video_url || '').trim();
    const embedUrl = String(episode.link_embed || episode.link_iframe || episode.embed_url || '').trim();

    if (!isAbsoluteHttpUrl(hlsUrl) && !isAbsoluteHttpUrl(embedUrl)) return null;

    return {
        hlsUrl: isAbsoluteHttpUrl(hlsUrl) ? hlsUrl : '',
        embedUrl: isAbsoluteHttpUrl(embedUrl) ? embedUrl : '',
        episodeName: episode.name || `Episode ${episodeIndex + 1}`,
        episodeIndex,
        serverIndex,
        provider
    };
}

function episodeIdentity(episode) {
    const values = [episode?.slug, episode?.name, episode?.filename].map(value => String(value || '').trim().toLowerCase());
    for (const value of values) {
        if (!value) continue;
        if (/^(full|tap-full|episode-full)$/.test(value)) return 'full';
        const numbered = value.match(/(?:tap|tập|episode|ep)?\s*[-_. ]*(\d{1,4})(?:\D|$)/i);
        if (numbered) return `number:${Number(numbered[1])}`;
    }
    return values.map(value => value.replace(/[^a-z0-9]+/g, '')).find(Boolean) || '';
}

function normaliseLanguageText(value = '') {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function isRequestedServerIndex(value) {
    return value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;
}

function preferredServerIndex(movie, requestedServerIndex) {
    const servers = Array.isArray(movie?.episodes) ? movie.episodes : [];
    if (isRequestedServerIndex(requestedServerIndex)) return Math.min(normalizeIndex(requestedServerIndex, 0), Math.max(0, servers.length - 1));

    const language = normaliseLanguageText([
        movie?.lang,
        ...(Array.isArray(movie?.lang_key) ? movie.lang_key : [])
    ].join(' '));
    const preferredLabels = [];
    if (/long tieng|longtieng|\bdub\b|\blt\b/.test(language)) preferredLabels.push(/long\s*tieng|longtieng|\bdub\b/i);
    if (/thuyet minh|thuyetminh|\btm\b/.test(language)) preferredLabels.push(/thuyet\s*minh|thuyetminh|\btm\b/i);

    for (const label of preferredLabels) {
        const index = servers.findIndex(server => label.test(normaliseLanguageText(server?.server_name)) && Array.isArray(server?.server_data) && server.server_data.length > 0);
        if (index !== -1) return index;
    }
    return 0;
}

function pickEpisodeSource(episodes, episodeIndex, serverIndex, provider = 'kkphim', requestedEpisode = null, options = {}) {
    const servers = Array.isArray(episodes) ? episodes : [];
    const attempts = [];
    const seen = new Set();

    const addAttempt = (serverIdx, epIdx) => {
        const key = `${serverIdx}:${epIdx}`;
        if (seen.has(key)) return;
        seen.add(key);
        attempts.push({ serverIdx, epIdx });
    };

    const strictEpisodeMatch = Boolean(options.strictEpisodeMatch);
    const requestedIdentity = episodeIdentity(requestedEpisode);
    if (strictEpisodeMatch && requestedIdentity) {
        servers.forEach((server, serverIdx) => {
            const serverData = Array.isArray(server?.server_data) ? server.server_data : [];
            serverData.forEach((episode, episodeIdx) => {
                if (episodeIdentity(episode) === requestedIdentity) addAttempt(serverIdx, episodeIdx);
            });
        });
    }
    if (strictEpisodeMatch) {
        if (attempts.length > 0) {
            // Exact title/number match is the only allowed fallback for a series.
        } else {
            const playable = servers.flatMap((server, serverIdx) => (Array.isArray(server?.server_data) ? server.server_data : [])
                .map((episode, episodeIdx) => ({ serverIdx, episodeIdx, episode }))
                .filter(({ episode }) => createEpisodeSourceCandidate(episode, 0, 0, provider)));
            const isSingleEpisodeFallback = episodeIndex === 0 && playable.length > 0 && playable.every(({ episode }) => episodeIdentity(episode) === 'full' || !episodeIdentity(episode));
            if (!isSingleEpisodeFallback) return null;
            playable.forEach(({ serverIdx, episodeIdx }) => addAttempt(serverIdx, episodeIdx));
        }
    } else {
        addAttempt(serverIndex, episodeIndex);
    }
    if (strictEpisodeMatch) {
        // Do not fall through to index-based attempts after a mapped fallback.
    } else {
    servers.forEach((_server, idx) => addAttempt(idx, episodeIndex));

    const requestedServer = servers[serverIndex];
    const requestedServerData = Array.isArray(requestedServer?.server_data) ? requestedServer.server_data : [];
    requestedServerData.forEach((_episode, idx) => addAttempt(serverIndex, idx));

    servers.forEach((server, idx) => {
        const serverData = Array.isArray(server?.server_data) ? server.server_data : [];
        serverData.forEach((_episode, epIdx) => addAttempt(idx, epIdx));
    });
    }

    for (const attempt of attempts) {
        const server = servers[attempt.serverIdx];
        const serverData = Array.isArray(server?.server_data) ? server.server_data : [];
        const candidate = createEpisodeSourceCandidate(serverData[attempt.epIdx], attempt.epIdx, attempt.serverIdx, provider);
        if (candidate) return candidate;
    }

    return null;
}

async function canProxyHlsSource(fetchImpl, urlValue, provider = 'kkphim') {
    if (!isAbsoluteHttpUrl(urlValue)) return false;

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), HLS_VALIDATION_TIMEOUT_MS) : null;

    try {
        const response = await fetchImpl(urlValue, {
            method: 'GET',
            signal: controller?.signal,
            headers: {
                Accept: 'application/vnd.apple.mpegurl, application/x-mpegURL, */*',
                Range: 'bytes=0-65535',
                Referer: PROVIDERS[provider]?.referrer || PROVIDERS.kkphim.referrer,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        return response.ok;
    } catch (error) {
        return false;
    } finally {
        if (timer) clearTimeout(timer);
    }
}

async function finalizeEpisodeSource(fetchImpl, candidate) {
    if (!candidate) return null;

    if (candidate.hlsUrl) {
        if (!ENABLE_STREAM_PROXY) {
            return {
                ...candidate,
                url: candidate.hlsUrl,
                type: 'hls-direct',
                fallbackReason: 'stream-proxy-disabled'
            };
        }

        const canProxyHls = await canProxyHlsSource(fetchImpl, candidate.hlsUrl, candidate.provider);
        if (canProxyHls) {
            return {
                ...candidate,
                url: candidate.hlsUrl,
                type: 'hls'
            };
        }

        if (candidate.embedUrl && ALLOW_EXTERNAL_EMBED_FALLBACK) {
            return {
                ...candidate,
                url: candidate.embedUrl,
                type: 'embed',
                fallbackReason: 'hls-proxy-unavailable'
            };
        }

        return {
            ...candidate,
            url: candidate.hlsUrl,
            type: 'hls-direct',
            fallbackReason: 'hls-proxy-unavailable'
        };
    }

    if (candidate.embedUrl && ALLOW_EXTERNAL_EMBED_FALLBACK) {
        return {
            ...candidate,
            url: candidate.embedUrl,
            type: 'embed'
        };
    }

    return null;
}

async function fetchJson(fetchImpl, urlValue) {
    const response = await fetchImpl(urlValue, {
        headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    if (!response.ok) {
        throw createHttpError(`Upstream error: ${response.status}`, response.status);
    }

    return response.json();
}

async function resolveEpisodeSource(fetchImpl, options) {
    const episodeIndex = normalizeIndex(options.episodeIndex, 0);
    const resolved = await resolveMovie(fetchImpl, { m: options.movieId, slug: options.slug });
    const serverIndex = preferredServerIndex(resolved.movie, options.serverIndex);
    let source = null;
    let movieName = resolved.movie?.name || resolved.movie?.origin_name || options.slug;
    const primaryEntry = resolved.sourceMovie;
    const requestedEpisode = primaryEntry?.movie?.episodes?.[serverIndex]?.server_data?.[episodeIndex] || null;
    if (primaryEntry) {
        const candidate = pickEpisodeSource(primaryEntry.movie?.episodes, episodeIndex, serverIndex, 'kkphim', requestedEpisode);
        source = await finalizeEpisodeSource(fetchImpl, candidate);
    }

    if (!source || !/^https?:\/\//i.test(source.url)) {
        throw createHttpError('No playable source was found', 404);
    }

    return {
        ...source,
        movieName,
        episodeIndex,
        serverIndex
    };
}

function renderPlayerHtml(source = {}, slug, epIndex, svIndex, movieId = '') {
    const title = `${source.movieName || 'Quán Chill'} - ${source.episodeName || ''}`.trim();
    const safeTitle = escapeHtml(title);
    const unavailableMessage = source.message || PLAYER_UNAVAILABLE_MESSAGE;
    const noSourceMessage = `<div class="message"><div><strong>${escapeHtml(unavailableMessage)}</strong><p>Vui lòng quay lại sau.</p></div></div>`;
    const statusScript = status => `
            <script>
                (function () {
                    try {
                        window.parent.postMessage({
                            type: 'qc-player-${status}',
                            message: ${JSON.stringify(unavailableMessage)}
                        }, window.location.origin);
                    } catch (e) {}
                }());
            </script>
        `;
    let playerMarkup = noSourceMessage;
    let scriptMarkup = statusScript('error');

    if (source.url && (source.type === 'hls' || source.type === 'hls-direct' || isHlsUrl(source.url))) {
        const streamUrl = source.type === 'hls-direct'
            ? source.url
            : `/api/stream?t=${encodeURIComponent(createSignedToken(source.url, PLAYER_TOKEN_TTL_SECONDS, 'stream'))}`;
        playerMarkup = `
            <video id="moviePlayer" controls autoplay playsinline preload="metadata"
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablepictureinpicture
                referrerpolicy="no-referrer"></video>
        `;
        scriptMarkup = `
            <script src="/assets/hls.min.js"></script>
            <script>
                (function () {
                    var video = document.getElementById('moviePlayer');
                    var source = ${JSON.stringify(streamUrl)};
                    var embedFallback = ${JSON.stringify(ALLOW_EXTERNAL_EMBED_FALLBACK ? (source.embedUrl || '') : '')};
                    var slug = ${JSON.stringify(slug || '')};
                    var movieKey = ${JSON.stringify(movieId || slug || '')};
                    var ep = ${JSON.stringify(epIndex !== undefined ? String(epIndex) : '')};
                    var sv = ${JSON.stringify(svIndex !== undefined ? String(svIndex) : '')};
                    if (!video) return;

                    function postPlayerStatus(status, message) {
                        try {
                            window.parent.postMessage({
                                type: 'qc-player-' + status,
                                message: message || ''
                            }, window.location.origin);
                        } catch (e) {}
                    }

                    var readyPosted = false;
                    var startupFallbackTimer = null;
                    function clearStartupFallbackTimer() {
                        if (!startupFallbackTimer) return;
                        clearTimeout(startupFallbackTimer);
                        startupFallbackTimer = null;
                    }

                    function postReady() {
                        if (readyPosted) return;
                        readyPosted = true;
                        clearStartupFallbackTimer();
                        postPlayerStatus('ready');
                    }

                    var embedFallbackStarted = false;
                    function loadEmbedFallback() {
                        if (!embedFallback || embedFallbackStarted) return false;
                        embedFallbackStarted = true;
                        clearStartupFallbackTimer();
                        postPlayerStatus('loading');
                        var frame = document.createElement('iframe');
                        frame.id = 'embedPlayer';
                        frame.src = embedFallback;
                        frame.title = ${JSON.stringify(title)};
                        frame.allow = 'autoplay';
                        frame.allowFullscreen = false;
                        frame.referrerPolicy = 'no-referrer';
                        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
                        frame.addEventListener('load', postReady);
                        video.replaceWith(frame);
                        return true;
                    }

                    postPlayerStatus('loading');
                    if (embedFallback) {
                        startupFallbackTimer = setTimeout(function () {
                            if (!readyPosted) loadEmbedFallback();
                        }, 12000);
                    }

                    var savedProgress = null;
                    if (slug && ep !== '') {
                        try {
                            var progressData = localStorage.getItem('watchProgress_' + movieKey) || localStorage.getItem('watchProgress_' + slug);
                            if (progressData) {
                                var parsedProgress = JSON.parse(progressData);
                                var parsedTime = Number(parsedProgress && parsedProgress.time);
                                if (parsedProgress && String(parsedProgress.ep) === ep &&
                                    Number.isFinite(parsedTime) && parsedTime > 0) {
                                    savedProgress = {
                                        time: parsedTime,
                                        ep: ep,
                                        sv: String(parsedProgress.sv || '0')
                                    };
                                }
                            }
                        } catch (e) {
                            // A malformed local value should not affect playback.
                        }
                    }

                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: false,
                            backBufferLength: 60
                        });
                        hls.on(window.Hls.Events.ERROR, function (_event, data) {
                            if (data && data.fatal) {
                                if (!loadEmbedFallback()) {
                                    postPlayerStatus('error', ${JSON.stringify(PLAYER_UNAVAILABLE_MESSAGE)});
                                }
                            }
                        });
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            doSeek();
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.outerHTML = ${JSON.stringify(noSourceMessage)};
                        postPlayerStatus('error', ${JSON.stringify(PLAYER_UNAVAILABLE_MESSAGE)});
                    }

                    // HLS metadata can arrive before its seekable range is ready.
                    // Retry a few times and only consider the restore complete once
                    // the browser actually moves the playhead.
                    var seeked = false;
                    var seekAttempts = 0;
                    var seekRetryTimer = null;
                    function doSeek() {
                        if (seeked || !savedProgress || seekAttempts >= 10) return;

                        var targetTime = savedProgress.time;
                        if (Number.isFinite(video.duration) && video.duration > 0) {
                            // Do not restore a completed video to its final frame.
                            if (targetTime >= video.duration - 3) return;
                            targetTime = Math.min(targetTime, Math.max(0, video.duration - 1));
                        }

                        if (video.seekable && video.seekable.length) {
                            var rangeStart = video.seekable.start(0);
                            var rangeEnd = video.seekable.end(video.seekable.length - 1);
                            if (targetTime < rangeStart || targetTime > rangeEnd) {
                                targetTime = Math.min(Math.max(targetTime, rangeStart), Math.max(rangeStart, rangeEnd - 0.25));
                            }
                        }

                        try {
                            seekAttempts += 1;
                            video.currentTime = targetTime;
                            clearTimeout(seekRetryTimer);
                            seekRetryTimer = setTimeout(function () {
                                if (!seeked) doSeek();
                            }, 500);
                        } catch (e) {
                            seekAttempts += 1;
                        }
                    }
                    video.addEventListener('loadedmetadata', doSeek);
                    video.addEventListener('durationchange', doSeek);
                    video.addEventListener('progress', doSeek);
                    video.addEventListener('loadeddata', function () {
                        doSeek();
                        postReady();
                    });
                    video.addEventListener('canplay', function () {
                        doSeek();
                        postReady();
                    });
                    video.addEventListener('playing', postReady);
                    video.addEventListener('seeked', function () {
                        if (!savedProgress) return;
                        if (Math.abs(video.currentTime - savedProgress.time) < 3) {
                            seeked = true;
                            clearTimeout(seekRetryTimer);
                        }
                    });
                    video.addEventListener('error', function () {
                        if (!loadEmbedFallback()) {
                            postPlayerStatus('error', ${JSON.stringify(PLAYER_UNAVAILABLE_MESSAGE)});
                        }
                    });

                    // Persist periodically and again when this iframe is closed.
                    // The latter is essential when a viewer leaves just after
                    // seeking or before the three-second interval has elapsed.
                    var lastSaveTime = 0;
                    function saveProgress(force) {
                        if (!slug || ep === '') return;
                        var now = Date.now();
                        if (!force && now - lastSaveTime < 3000) return;

                        var currentTime = Number(video.currentTime);
                        if (!Number.isFinite(currentTime) || currentTime <= 0) return;

                        try {
                            if (Number.isFinite(video.duration) && video.duration > 0 && currentTime >= video.duration - 3) {
                                localStorage.removeItem('watchProgress_' + movieKey);
                                return;
                            }

                            lastSaveTime = now;
                            localStorage.setItem('watchProgress_' + movieKey, JSON.stringify({
                                ep: ep,
                                sv: sv,
                                time: currentTime,
                                updatedAt: now
                            }));
                        } catch (e) {
                            // Storage may be disabled by the browser; playback still works.
                        }
                    }
                    video.addEventListener('timeupdate', function () {
                        saveProgress(false);
                    });
                    video.addEventListener('pause', function () { saveProgress(true); });
                    video.addEventListener('ended', function () {
                        try { localStorage.removeItem('watchProgress_' + movieKey); } catch (e) {}
                    });
                    window.addEventListener('pagehide', function () { saveProgress(true); });
                    document.addEventListener('visibilitychange', function () {
                        if (document.visibilityState === 'hidden') saveProgress(true);
                    });

                    document.addEventListener('contextmenu', function (event) { event.preventDefault(); }, true);
                }());
            </script>
        `;
    } else if (source.url && source.type === 'embed' && ALLOW_EXTERNAL_EMBED_FALLBACK) {
        playerMarkup = `
            <iframe id="embedPlayer" src="${escapeAttr(source.url)}"
                title="${safeTitle}"
                allow="autoplay"
                referrerpolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
        `;
        scriptMarkup = `
            <script>
                (function () {
                    function postPlayerStatus(status, message) {
                        try {
                            window.parent.postMessage({
                                type: 'qc-player-' + status,
                                message: message || ''
                            }, window.location.origin);
                        } catch (e) {}
                    }

                    var frame = document.getElementById('embedPlayer');
                    postPlayerStatus('loading');
                    if (frame) {
                        frame.addEventListener('load', function () {
                            postPlayerStatus('ready');
                        });
                    }
                }());
            </script>
        `;
    }

    return `<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="no-referrer">
    <title>${safeTitle}</title>
    <style>
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            overflow: hidden;
            background: #05070d;
            color: #f8fafc;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        iframe, video {
            display: block;
            width: 100%;
            height: 100%;
            border: 0;
            background: #000;
        }
        .message {
            display: grid;
            width: 100%;
            height: 100%;
            place-items: center;
            color: #cbd5e1;
            text-align: center;
            padding: 24px;
            box-sizing: border-box;
        }
        .message strong {
            display: block;
            color: #f8fafc;
            font-size: clamp(18px, 3vw, 26px);
            line-height: 1.25;
        }
        .message p {
            margin: 10px 0 0;
            color: #94a3b8;
            font-size: 14px;
        }
    </style>
</head>
<body>
    ${playerMarkup}
    ${scriptMarkup}
</body>
</html>`;
}

function isStreamProxyEnabled() {
    return ENABLE_STREAM_PROXY;
}

function isImageProxyEnabled() {
    return ENABLE_IMAGE_PROXY;
}

module.exports = {
    API_BASE_URL,
    assertSecurityConfiguration,
    buildClientApiUrl,
    createHttpError,
    buildUpstreamApiUrl,
    checkRateLimit,
    createSignedToken,
    getSecurityLockRetryAfter,
    isImageProxyEnabled,
    getRequestOrigin,
    isSameOriginRequest,
    isSecurityLockedRequest,
    isStreamProxyEnabled,
    normalizeApiPath,
    normalizeImageUrl,
    normalizeIndex,
    normalizeSlug,
    pickEpisodeSource,
    renderPlayerHtml,
    resolveImageTarget,
    resolveEpisodeSource,
    rewriteM3u8Playlist,
    sanitizeUpstreamData,
    setSecurityLockCookie,
    setSecurityHeaders,
    verifySignedToken
};
