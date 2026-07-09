const crypto = require('crypto');

const API_BASE_URL = (process.env.MOVIE_API_BASE_URL || 'https://ophim1.com').replace(/\/+$/, '');
const FALLBACK_API_BASE_URL = (process.env.FALLBACK_MOVIE_API_BASE_URL || 'https://phimapi.com').replace(/\/+$/, '');
const CDN_IMAGE_BASE_URL = (process.env.CDN_IMAGE_BASE_URL || 'https://img.ophim.live/uploads/movies/').replace(/\/?$/, '/');
const PLAYER_TOKEN_SECRET = process.env.PLAYER_TOKEN_SECRET || process.env.JWT_SECRET || 'quanchill-local-player-secret-change-me';
const PLAYER_TOKEN_TTL_SECONDS = Math.max(30, Number(process.env.PLAYER_TOKEN_TTL_SECONDS || 300));
const HLS_VALIDATION_TIMEOUT_MS = Math.max(800, Number(process.env.HLS_VALIDATION_TIMEOUT_MS || 2200));
const IMAGE_TOKEN_TTL_SECONDS = Math.max(300, Number(process.env.IMAGE_TOKEN_TTL_SECONDS || 1209600));
const ENABLE_STREAM_PROXY = process.env.ENABLE_STREAM_PROXY === 'true';
const ENABLE_IMAGE_PROXY = process.env.ENABLE_IMAGE_PROXY === 'true';
const SECURITY_LOCK_SECRET = process.env.SECURITY_LOCK_SECRET || PLAYER_TOKEN_SECRET;
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
    /^\/v1\/api\/danh-sach\/[a-z0-9-]+$/,
    /^\/v1\/api\/tim-kiem$/,
    /^\/v1\/api\/phim\/[a-z0-9-]+$/,
    /^\/v1\/api\/phim\/[a-z0-9-]+\/images$/,
    /^\/v1\/api\/the-loai$/,
    /^\/v1\/api\/the-loai\/[a-z0-9-]+$/,
    /^\/v1\/api\/quoc-gia$/,
    /^\/v1\/api\/quoc-gia\/[a-z0-9-]+$/
];

const CLIENT_KIND_MAP = {
    a: '/v1/api/danh-sach/phim-moi-cap-nhat',
    b: '/v1/api/danh-sach/phim-bo',
    c: '/v1/api/danh-sach/phim-le',
    d: '/v1/api/danh-sach/phim-chieu-rap',
    e: '/v1/api/tim-kiem',
    j: '/v1/api/the-loai',
    k: '/v1/api/quoc-gia'
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
    'img.ophim.live',
    'image.tmdb.org',
    'via.placeholder.com'
]);

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
    if (/(^|[.\-/])(?:o?phim|phimapi)(?:[.\-/]|$)/i.test(text)) return '';
    return text;
}

function createImageProxyPath(src, sourceKey = '') {
    try {
        const targetUrl = normalizeImageUrl(src, sourceKey);
        if (!ENABLE_IMAGE_PROXY) return targetUrl.toString();
        return `/api/i?t=${encodeURIComponent(createSignedToken(targetUrl, IMAGE_TOKEN_TTL_SECONDS))}`;
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
        targetUrl = new URL(rawValue.replace(/^\/+/, ''), CDN_IMAGE_BASE_URL);
    }

    if (!IMAGE_HOST_ALLOWLIST.has(targetUrl.hostname)) {
        throw createHttpError('Image host is not allowed', 403);
    }

    return targetUrl.toString();
}

function resolveImageTarget(query = {}) {
    if (query.t) return verifySignedToken(query.t);
    if (query.p) return normalizeImageUrl(query.p);
    throw createHttpError('Missing image token', 400);
}

function getClientIp(req) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0].trim();
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

    if (origin && expectedOrigin && origin !== expectedOrigin) return false;

    if (referer && expectedOrigin) {
        try {
            return new URL(referer).origin === expectedOrigin;
        } catch (error) {
            return false;
        }
    }

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

function createSignedToken(url, ttlSeconds = PLAYER_TOKEN_TTL_SECONDS) {
    const payload = Buffer.from(JSON.stringify({
        u: String(url),
        exp: Date.now() + ttlSeconds * 1000
    }), 'utf8');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getTokenCipherKey(), iv);
    const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64url')}.${encrypted.toString('base64url')}.${tag.toString('base64url')}`;
}

function verifySignedToken(token) {
    const [ivPart, encryptedPart, tagPart] = String(token || '').split('.');
    if (!ivPart || !encryptedPart || !tagPart) {
        throw createHttpError('Missing stream token', 401);
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
        throw createHttpError('Invalid stream token', 401);
    }

    if (!data.u || !/^https?:\/\//i.test(data.u)) {
        throw createHttpError('Invalid stream target', 401);
    }

    if (!data.exp || Date.now() > data.exp) {
        throw createHttpError('Expired stream token', 401);
    }

    return data.u;
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
    const makeStreamUrl = target => `/api/stream?t=${encodeURIComponent(createSignedToken(absolutizeUrl(target, playlistUrl)))}`;

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

function createEpisodeSourceCandidate(episode, episodeIndex, serverIndex) {
    if (!episode) return null;

    const hlsUrl = String(episode.link_m3u8 || episode.m3u8 || episode.video_url || '').trim();
    const embedUrl = String(episode.link_embed || episode.link_iframe || episode.embed_url || '').trim();

    if (!isAbsoluteHttpUrl(hlsUrl) && !isAbsoluteHttpUrl(embedUrl)) return null;

    return {
        hlsUrl: isAbsoluteHttpUrl(hlsUrl) ? hlsUrl : '',
        embedUrl: isAbsoluteHttpUrl(embedUrl) ? embedUrl : '',
        episodeName: episode.name || `Episode ${episodeIndex + 1}`,
        episodeIndex,
        serverIndex
    };
}

function pickEpisodeSource(episodes, episodeIndex, serverIndex) {
    const servers = Array.isArray(episodes) ? episodes : [];
    const attempts = [];
    const seen = new Set();

    const addAttempt = (serverIdx, epIdx) => {
        const key = `${serverIdx}:${epIdx}`;
        if (seen.has(key)) return;
        seen.add(key);
        attempts.push({ serverIdx, epIdx });
    };

    addAttempt(serverIndex, episodeIndex);
    servers.forEach((_server, idx) => addAttempt(idx, episodeIndex));

    const requestedServer = servers[serverIndex];
    const requestedServerData = Array.isArray(requestedServer?.server_data) ? requestedServer.server_data : [];
    requestedServerData.forEach((_episode, idx) => addAttempt(serverIndex, idx));

    servers.forEach((server, idx) => {
        const serverData = Array.isArray(server?.server_data) ? server.server_data : [];
        serverData.forEach((_episode, epIdx) => addAttempt(idx, epIdx));
    });

    for (const attempt of attempts) {
        const server = servers[attempt.serverIdx];
        const serverData = Array.isArray(server?.server_data) ? server.server_data : [];
        const candidate = createEpisodeSourceCandidate(serverData[attempt.epIdx], attempt.epIdx, attempt.serverIdx);
        if (candidate) return candidate;
    }

    return null;
}

async function canProxyHlsSource(fetchImpl, urlValue) {
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
                Referer: 'https://ophim1.com/',
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

        const canProxyHls = await canProxyHlsSource(fetchImpl, candidate.hlsUrl);
        if (canProxyHls) {
            return {
                ...candidate,
                url: candidate.hlsUrl,
                type: 'hls'
            };
        }

        if (candidate.embedUrl) {
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

    if (candidate.embedUrl) {
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
    const slug = normalizeSlug(options.slug);
    const episodeIndex = normalizeIndex(options.episodeIndex, 0);
    const serverIndex = normalizeIndex(options.serverIndex, 0);

    const primaryUrl = buildUpstreamApiUrl(`/v1/api/phim/${slug}`);
    const primaryData = await fetchJson(fetchImpl, primaryUrl.toString());
    const primaryMovie = primaryData?.data?.item || primaryData?.movie || primaryData?.item;

    let source = await finalizeEpisodeSource(
        fetchImpl,
        pickEpisodeSource(primaryMovie?.episodes, episodeIndex, serverIndex)
    );
    let movieName = primaryMovie?.name || primaryMovie?.origin_name || slug;

    if (!source) {
        try {
            const fallbackUrl = `${FALLBACK_API_BASE_URL}/phim/${encodeURIComponent(slug)}`;
            const fallbackData = await fetchJson(fetchImpl, fallbackUrl);
            const fallbackMovie = fallbackData?.movie || fallbackData?.data?.item || fallbackData?.item;
            source = await finalizeEpisodeSource(
                fetchImpl,
                pickEpisodeSource(fallbackData?.episodes || fallbackMovie?.episodes, episodeIndex, serverIndex)
            );
            movieName = fallbackMovie?.name || fallbackMovie?.origin_name || movieName;
        } catch (fallbackError) {
            if (!primaryMovie) throw fallbackError;
        }
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

function renderPlayerHtml(source = {}, slug, epIndex, svIndex) {
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
            : `/api/stream?t=${encodeURIComponent(createSignedToken(source.url))}`;
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
                    var embedFallback = ${JSON.stringify(source.embedUrl || '')};
                    var slug = ${JSON.stringify(slug || '')};
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
                    function postReady() {
                        if (readyPosted) return;
                        readyPosted = true;
                        postPlayerStatus('ready');
                    }

                    var embedFallbackStarted = false;
                    function loadEmbedFallback() {
                        if (!embedFallback || embedFallbackStarted) return false;
                        embedFallbackStarted = true;
                        postPlayerStatus('loading');
                        var frame = document.createElement('iframe');
                        frame.id = 'embedPlayer';
                        frame.src = embedFallback;
                        frame.title = ${JSON.stringify(title)};
                        frame.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
                        frame.allowFullscreen = true;
                        frame.referrerPolicy = 'no-referrer';
                        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
                        frame.addEventListener('load', postReady);
                        video.replaceWith(frame);
                        return true;
                    }

                    postPlayerStatus('loading');

                    var savedProgress = null;
                    if (slug && ep) {
                        try {
                            var progressData = localStorage.getItem('watchProgress_' + slug);
                            if (progressData) {
                                savedProgress = JSON.parse(progressData);
                            }
                        } catch (e) {
                            console.error('Error loading progress:', e);
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
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.outerHTML = ${JSON.stringify(noSourceMessage)};
                        postPlayerStatus('error', ${JSON.stringify(PLAYER_UNAVAILABLE_MESSAGE)});
                    }

                    // Seek to saved progress once metadata or data loads
                    var seeked = false;
                    function doSeek() {
                        if (seeked) return;
                        if (savedProgress && String(savedProgress.ep) === ep && savedProgress.time > 0) {
                            try {
                                video.currentTime = savedProgress.time;
                                seeked = true;
                            } catch (e) {}
                        }
                    }
                    video.addEventListener('loadedmetadata', doSeek);
                    video.addEventListener('loadeddata', function () {
                        doSeek();
                        postReady();
                    });
                    video.addEventListener('canplay', function () {
                        doSeek();
                        postReady();
                    });
                    video.addEventListener('playing', postReady);
                    video.addEventListener('error', function () {
                        if (!loadEmbedFallback()) {
                            postPlayerStatus('error', ${JSON.stringify(PLAYER_UNAVAILABLE_MESSAGE)});
                        }
                    });

                    // Periodically save progress on timeupdate
                    var lastSaveTime = 0;
                    video.addEventListener('timeupdate', function () {
                        if (!slug || !ep) return;
                        var now = Date.now();
                        if (now - lastSaveTime > 3000) {
                            lastSaveTime = now;
                            try {
                                localStorage.setItem('watchProgress_' + slug, JSON.stringify({
                                    ep: ep,
                                    sv: sv,
                                    time: video.currentTime,
                                    updatedAt: now
                                }));
                            } catch (e) {}
                        }
                    });

                    document.addEventListener('contextmenu', function (event) { event.preventDefault(); }, true);
                }());
            </script>
        `;
    } else if (source.url) {
        playerMarkup = `
            <iframe id="embedPlayer" src="${escapeAttr(source.url)}"
                title="${safeTitle}"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowfullscreen
                referrerpolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"></iframe>
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

module.exports = {
    API_BASE_URL,
    buildClientApiUrl,
    createHttpError,
    buildUpstreamApiUrl,
    checkRateLimit,
    createSignedToken,
    getSecurityLockRetryAfter,
    getRequestOrigin,
    isSameOriginRequest,
    isSecurityLockedRequest,
    isStreamProxyEnabled,
    normalizeApiPath,
    normalizeImageUrl,
    normalizeIndex,
    normalizeSlug,
    renderPlayerHtml,
    resolveImageTarget,
    resolveEpisodeSource,
    rewriteM3u8Playlist,
    sanitizeUpstreamData,
    setSecurityLockCookie,
    setSecurityHeaders,
    verifySignedToken
};
