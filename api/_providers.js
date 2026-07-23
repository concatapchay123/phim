/*
 * KKPhim adapter for the public movie catalogue.  HTTP handlers and security
 * policy stay in the route modules; this file owns only upstream paths and
 * the small response normalisation layer used by the frontend.
 */
const crypto = require('crypto');

const PROVIDERS = {
    kkphim: {
        id: 'kkphim',
        baseUrl: (process.env.KKPHIM_API_BASE_URL || 'https://phimapi.com').replace(/\/+$/, ''),
        imageBaseUrl: (process.env.KKPHIM_IMAGE_BASE_URL || 'https://phimimg.com/').replace(/\/?$/, '/'),
        referrer: 'https://www.kkphim2.com/'
    }
};

const LIST_KINDS = new Set(['a', 'b', 'c', 'd', 'e', 'h', 'i']);
const TAXONOMY_KINDS = new Set(['j', 'k', 'l']);
const DETAIL_KINDS = new Set(['f', 'g', 'm', 'n']);
const ALLOWED_QUERY = new Set(['page', 'limit', 'keyword', 'sort_field', 'sort_type', 'sort_lang', 'category', 'country', 'year']);
const DEFAULT_TIMEOUT_MS = Math.max(900, Number(process.env.KKPHIM_API_TIMEOUT_MS || 2500));
const MOVIE_ID_VERSION = 'q1';
// A dedicated secret allows independent rotation.  Existing deployments can
// safely derive this key from PLAYER_TOKEN_SECRET until MOVIE_ID_SECRET is set.
const LOCAL_MOVIE_ID_SECRET = 'quanchill-local-movie-id-secret-change-me';
const MOVIE_ID_SECRET = process.env.MOVIE_ID_SECRET || process.env.PLAYER_TOKEN_SECRET || LOCAL_MOVIE_ID_SECRET;

function createHttpError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeSlug(value) {
    const slug = String(value || '').trim().toLowerCase();
    if (!/^[a-z0-9-]{1,160}$/.test(slug)) throw createHttpError('Invalid movie slug', 400);
    return slug;
}

function movieIdKey() {
    return crypto.createHash('sha256').update(`movie-id:${MOVIE_ID_SECRET}`).digest();
}

function encodeMovieId(refs) {
    const reference = (Array.isArray(refs) ? refs : []).find(ref => ref && ref.provider === 'kkphim' && /^[a-z0-9-]{1,160}$/.test(ref.slug || ''));
    if (!reference) return '';

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', movieIdKey(), iv);
    const payload = Buffer.from(JSON.stringify({ p: 'kkphim', s: reference.slug }), 'utf8');
    const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${MOVIE_ID_VERSION}.${iv.toString('base64url')}.${encrypted.toString('base64url')}.${tag.toString('base64url')}`;
}

function normaliseMovieReference(value) {
    if (!value || String(value.p || '') !== 'kkphim') return [];
    try {
        return [{ provider: 'kkphim', slug: normalizeSlug(value.s) }];
    } catch (_) {
        return [];
    }
}

function decodeOpaqueMovieId(value) {
    const [version, ivPart, encryptedPart, tagPart] = String(value || '').split('.');
    if (version !== MOVIE_ID_VERSION || !ivPart || !encryptedPart || !tagPart) return [];

    try {
        const decipher = crypto.createDecipheriv('aes-256-gcm', movieIdKey(), Buffer.from(ivPart, 'base64url'));
        decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedPart, 'base64url')),
            decipher.final()
        ]);
        return normaliseMovieReference(JSON.parse(decrypted.toString('utf8')));
    } catch (_) {
        return [];
    }
}

function decodeLegacyMovieId(value) {
    try {
        const refs = JSON.parse(Buffer.from(String(value), 'base64url').toString('utf8'));
        if (!Array.isArray(refs)) return [];
        // Preserve existing browser URLs while only emitting opaque IDs going
        // forward. Retired provider references are intentionally ignored.
        return normaliseMovieReference(refs.find(ref => String(ref?.p || '') === 'kkphim'));
    } catch (_) {
        return [];
    }
}

function decodeMovieId(value) {
    const movieId = String(value || '');
    if (!movieId || movieId.length > 1024) return [];
    return movieId.startsWith(`${MOVIE_ID_VERSION}.`) ? decodeOpaqueMovieId(movieId) : decodeLegacyMovieId(movieId);
}

function providerPath(kind, params = {}) {
    const slug = params.s || params.slug;
    const paths = {
        a: '/v1/api/home',
        b: '/v1/api/danh-sach/phim-bo',
        c: '/v1/api/danh-sach/phim-le',
        d: '/v1/api/danh-sach/phim-chieu-rap',
        e: '/v1/api/tim-kiem',
        j: '/v1/api/the-loai',
        k: '/v1/api/quoc-gia',
        l: '/nam-phat-hanh'
    };
    if (kind === 'f') return `/v1/api/phim/${normalizeSlug(slug)}`;
    if (kind === 'g') return `/v1/api/phim/${normalizeSlug(slug)}/images`;
    if (kind === 'm') return `/v1/api/phim/${normalizeSlug(slug)}/peoples`;
    if (kind === 'n') return `/v1/api/phim/${normalizeSlug(slug)}/keywords`;
    if (kind === 'h') return `/v1/api/the-loai/${normalizeSlug(slug)}`;
    if (kind === 'i') return `/v1/api/quoc-gia/${normalizeSlug(slug)}`;
    if (!paths[kind]) throw createHttpError('Unknown API kind', 403);
    return paths[kind];
}

function appendQuery(url, params = {}) {
    Object.keys(params).forEach(key => {
        if (!ALLOWED_QUERY.has(key)) return;
        const raw = Array.isArray(params[key]) ? params[key][0] : params[key];
        if (raw === undefined || raw === null || raw === '') return;
        let value = String(raw).trim();
        if (key === 'page') value = String(Math.min(1000, Math.max(1, Number.parseInt(value, 10) || 1)));
        if (key === 'limit') value = String(Math.min(64, Math.max(1, Number.parseInt(value, 10) || 24)));
        if (key === 'keyword') value = value.slice(0, 80);
        if (key === 'year' && !/^\d{4}(,\d{4})?$/.test(value)) return;
        if (value) url.searchParams.set(key, value);
    });
}

function buildProviderUrl(providerId, kind, params = {}) {
    if (providerId !== 'kkphim') throw createHttpError('Unknown provider', 403);
    const url = new URL(`${PROVIDERS.kkphim.baseUrl}${providerPath(kind, params)}`);
    appendQuery(url, params);
    return url;
}

async function fetchProvider(fetchImpl, providerId, kind, params = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const url = buildProviderUrl(providerId, kind, params);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchImpl(url.toString(), {
            signal: controller.signal,
            headers: { Accept: 'application/json', 'User-Agent': 'QuanChill KKPhim catalogue' }
        });
        if (!response.ok) throw createHttpError(`Upstream error: ${response.status}`, response.status);
        return { provider: 'kkphim', url, payload: await response.json() };
    } finally {
        clearTimeout(timer);
    }
}

function payloadItems(payload) {
    return Array.isArray(payload?.data?.items) ? payload.data.items : (Array.isArray(payload?.items) ? payload.items : []);
}

function payloadMovie(payload) {
    return payload?.data?.item || payload?.movie || payload?.item || null;
}

function imageUrlFor(providerId, value) {
    if (providerId !== 'kkphim') throw createHttpError('Unknown provider', 403);
    const raw = String(value || '').trim();
    if (!raw || /^https?:\/\//i.test(raw) || raw.startsWith('/api/')) return raw;
    return new URL(raw.replace(/^\/+/, ''), PROVIDERS.kkphim.imageBaseUrl).toString();
}

function normaliseMovie(movie) {
    if (!movie || typeof movie !== 'object') return null;
    const slug = normalizeSlug(movie.slug);
    const source = { provider: 'kkphim', slug };
    const { provider: _provider, source_refs: _sourceRefs, ...publicMovie } = movie;
    return {
        ...publicMovie,
        slug,
        poster_url: imageUrlFor('kkphim', movie.poster_url),
        thumb_url: imageUrlFor('kkphim', movie.thumb_url),
        movie_id: encodeMovieId([source])
    };
}

function sortMovies(items, params = {}) {
    const direction = String(params.sort_type || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const field = String(params.sort_field || 'modified.time');
    return items.sort((left, right) => {
        const getValue = item => field === 'year' ? Number(item.year || 0) : new Date(item.modified?.time || 0).getTime();
        return (getValue(left) - getValue(right)) * direction;
    });
}

function mergeMovies(records, params = {}) {
    return sortMovies(records
        .filter(record => record?.provider === 'kkphim')
        .map(record => normaliseMovie(record.movie))
        .filter(Boolean), params);
}

function taxonomyResponse(result) {
    return { status: 'success', message: '', data: { items: payloadItems(result.payload) } };
}

async function resolveMovie(fetchImpl, params = {}) {
    const reference = decodeMovieId(params.m || params.movie_id)[0];
    const slug = reference?.slug || normalizeSlug(params.s || params.slug);
    const result = await fetchProvider(fetchImpl, 'kkphim', 'f', { slug });
    const rawMovie = payloadMovie(result.payload);
    if (!rawMovie) throw createHttpError('Movie not found', 404);
    const movie = normaliseMovie(rawMovie);
    return { movie, sourceMovie: { provider: 'kkphim', movie: rawMovie, payload: result.payload } };
}

async function fetchUnified(fetchImpl, kindValue, params = {}) {
    const kind = String(kindValue || '');
    if (![...LIST_KINDS, ...TAXONOMY_KINDS, ...DETAIL_KINDS].includes(kind)) throw createHttpError('Unknown API kind', 403);

    if (kind === 'f') {
        const resolved = await resolveMovie(fetchImpl, params);
        return { status: 'success', message: '', data: { item: resolved.movie } };
    }

    if (DETAIL_KINDS.has(kind)) {
        const resolved = await resolveMovie(fetchImpl, params);
        const primary = await fetchProvider(fetchImpl, 'kkphim', kind, { slug: resolved.movie.slug });
        const { provider: _provider, provider_status: _providerStatus, source_refs: _sourceRefs, ...publicData } = primary.payload?.data || {};
        return { status: 'success', message: '', data: { ...publicData, movie_id: resolved.movie.movie_id } };
    }

    const page = Math.max(1, Number.parseInt(params.page, 10) || 1);
    const primary = await fetchProvider(fetchImpl, 'kkphim', kind, { ...params, page });
    if (TAXONOMY_KINDS.has(kind)) return taxonomyResponse(primary);

    const items = mergeMovies(payloadItems(primary.payload).map(movie => ({ provider: 'kkphim', movie })), params);
    const requestedLimit = Math.min(64, Math.max(1, Number.parseInt(params.limit, 10) || 24));
    const upstreamPagination = primary.payload?.data?.params?.pagination || primary.payload?.pagination || {};
    const upstreamCurrentPage = Number(upstreamPagination.currentPage || page);
    const upstreamTotalPages = Number(upstreamPagination.totalPages || 0);
    return {
        status: 'success',
        message: '',
        data: {
            items,
            params: {
                pagination: {
                    currentPage: upstreamCurrentPage,
                    totalItems: Number(upstreamPagination.totalItems || items.length),
                    totalItemsPerPage: Number(upstreamPagination.totalItemsPerPage || requestedLimit),
                    totalPages: upstreamTotalPages || undefined,
                    hasNext: upstreamTotalPages > 0 ? upstreamCurrentPage < upstreamTotalPages : items.length >= requestedLimit
                }
            }
        }
    };
}

module.exports = {
    PROVIDERS,
    buildProviderUrl,
    decodeMovieId,
    encodeMovieId,
    fetchProvider,
    fetchUnified,
    imageUrlFor,
    mergeMovies,
    normaliseMovie,
    resolveMovie
};
