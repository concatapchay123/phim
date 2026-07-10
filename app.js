// =========================================================================



// =========================================================================
// CONFIGURATION & CONSTANTS
// =========================================================================
// Bump this whenever the shape or validity period of API data changes.  It
// prevents stale localStorage entries from keeping expired signed image URLs.
const API_CACHE_PREFIX = 'qc_cache_v7_';
const OP_HOME = 'a';
const OP_PHIM_BO = 'b';
const OP_PHIM_LE = 'c';
const OP_PHIM_CHIEU_RAP = 'd';
const OP_SEARCH = 'e';
const OP_DETAILS = 'f';
const OP_IMAGES = 'g';
const OP_GENRE = 'h';
const OP_COUNTRY = 'i';
const OP_GENRES = 'j';
const OP_COUNTRIES = 'k';
const ROUTE_CLIENT = String.fromCharCode(47, 97, 112, 105, 47, 99);
const ROUTE_IMAGE = String.fromCharCode(47, 97, 112, 105, 47, 105);
const ROUTE_PLAYER = String.fromCharCode(47, 97, 112, 105, 47, 112, 108, 97, 121, 101, 114);
const PLAYER_UPDATE_MESSAGE = 'Phim hiện đang được cập nhật';
const ENABLE_GSAP = false;

const GENRE_MAP = {
    'hanh-dong': 'Hành Động',
    'bi-an': 'Bí ẩn',
    'kinh-di': 'Cổ Điển & Kinh Dị',
    'chinh-kich': 'Chính kịch',
    'co-trang': 'Cổ Trang',
    'gia-dinh': 'Gia Đình',
    'hai-huoc': 'Hài Hước',
    'tinh-cam': 'Tình Cảm',
    'vien-tuong': 'Viễn Tưởng',
    'phieu-luu': 'Phiêu Lưu',
    'khoa-hoc': 'Khoa Học',
    'hinh-su': 'Hình Sự',
    'vo-thuat': 'Võ Thuật',
    'than-thoai': 'Thần Thoại',
    'tam-ly': 'Tâm Lý',
    'tai-lieu': 'Tài Liệu',
    'hoc-duong': 'Học Đường',
    'gia-tuong': 'Giả Tưởng',
    'ca-nhac': 'Ca Nhạc',
    'the-thao': 'Thể Thao',
    'kich-tinh': 'Kịch Tính',
    'chien-tranh': 'Chiến Tranh',
    'kinh-dien': 'Kinh Điển',
    'anime': 'Anime',
    'hoat-hinh': 'Hoạt Hình'
};

const COUNTRY_MAP = {
    'trung-quoc': 'Trung Quốc',
    'han-quoc': 'Hàn Quốc',
    'nhat-ban': 'Nhật Bản',
    'my': 'Mỹ',
    'au-my': 'Âu Mỹ',
    'viet-nam': 'Việt Nam',
    'thai-lan': 'Thái Lan',
    'hong-kong': 'Hồng Kông',
    'dai-loan': 'Đài Loan',
    'an-do': 'Ấn Độ',
    'phap': 'Pháp',
    'anh': 'Anh',
    'canada': 'Canada',
    'duc': 'Đức',
    'tay-ban-nha': 'Tây Ban Nha',
    'nga': 'Nga'
};


// DOM Elements
const elements = {
    // Navigation & Header
    navbar: document.querySelector('.navbar'),
    logoLink: document.getElementById('logoLink'),
    navTrangChu: document.getElementById('navTrangChu'),
    navPhimMoi: document.getElementById('navPhimMoi'),
    navPhimBo: document.getElementById('navPhimBo'),
    navPhimLe: document.getElementById('navPhimLe'),
    navPhimChieuRap: document.getElementById('navPhimChieuRap'),
    navPhimDeCu: document.getElementById('navPhimDeCu'),
    navTopIMDb: document.getElementById('navTopIMDb'),
    navTheLoai: document.getElementById('navTheLoai'),
    navQuocGia: document.getElementById('navQuocGia'),
    dropdownTheLoai: document.getElementById('dropdownTheLoai'),
    dropdownQuocGia: document.getElementById('dropdownQuocGia'),
    navTuPhim: document.getElementById('navTuPhim'),
    navLinks: document.getElementById('navLinks'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    menuIconOpen: document.getElementById('menuIconOpen'),
    menuIconClose: document.getElementById('menuIconClose'),
    
    // Theme Toggle
    themeToggle: document.getElementById('themeToggle'),
    
    // Search
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),

    // Hero Section
    heroSection: document.getElementById('heroSection'),
    heroTitle: document.getElementById('heroTitle'),
    heroDesc: document.getElementById('heroDesc'),
    heroBtnPlay: document.getElementById('heroBtnPlay'),
    heroBtnInfo: document.getElementById('heroBtnInfo'),
    heroBtnFav: document.getElementById('heroBtnFav'),
    heroThumbs: document.getElementById('heroThumbs'),

    // Page Views
    homePage: document.getElementById('homePage'),
    gridViewPage: document.getElementById('gridViewPage'),
    libraryPage: document.getElementById('libraryPage'),

    // Horizontal rows
    rowPhimMoi: document.getElementById('rowPhimMoi'),
    rowPhimLe: document.getElementById('rowPhimLe'),
    rowPhimBo: document.getElementById('rowPhimBo'),
    rowPhimChieuRap: document.getElementById('rowPhimChieuRap'),

    // Grid View Page Elements
    gridPageTitle: document.getElementById('gridPageTitle'),
    movieGrid: document.getElementById('movieGrid'),
    gridLoader: document.getElementById('gridLoader'),
    gridNoResults: document.getElementById('gridNoResults'),
    gridPagination: document.getElementById('gridPagination'),
    gridPrevPage: document.getElementById('gridPrevPage'),
    gridNextPage: document.getElementById('gridNextPage'),
    gridPageInfo: document.getElementById('gridPageInfo'),

    // Filters
    toggleFilterBtn: document.getElementById('toggleFilterBtn'),
    filterPanel: document.getElementById('filterPanel'),
    filterGenre: document.getElementById('filterGenre'),
    filterCountry: document.getElementById('filterCountry'),
    filterYear: document.getElementById('filterYear'),
    filterSort: document.getElementById('filterSort'),
    applyFiltersBtn: document.getElementById('applyFiltersBtn'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    activeFilterChips: document.getElementById('activeFilterChips'),

    // Library Page
    watchlistGrid: document.getElementById('watchlistGrid'),
    watchlistEmpty: document.getElementById('watchlistEmpty'),
    historyList: document.getElementById('historyList'),
    historyEmpty: document.getElementById('historyEmpty'),
    watchlistPanel: document.getElementById('watchlistPanel'),
    historyPanel: document.getElementById('historyPanel'),
    countWatchlist: document.getElementById('countWatchlist'),
    countHistory: document.getElementById('countHistory'),

    // Details Modal
    movieModal: document.getElementById('movieModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalLoading: document.getElementById('modalLoading'),
    modalBody: document.getElementById('modalBody'),

    // Player Modal
    playerModal: document.getElementById('playerModal'),
    closePlayerBtn: document.getElementById('closePlayerBtn'),
    playerBody: document.getElementById('playerBody'),
    bottomNavItems: document.querySelectorAll('.bottom-nav-item'),
    quickSearchChips: document.querySelectorAll('.quick-search-chip'),

    // Member Controls & Login Modal
    navMemberBtn: document.getElementById('navMemberBtn'),
    memberDropdown: document.getElementById('memberDropdown'),
    memberWrapper: document.getElementById('memberWrapper'),
    loginModal: document.getElementById('loginModal'),
    closeLoginModalBtn: document.getElementById('closeLoginModalBtn'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    memberBtnTuPhim: document.getElementById('memberBtnTuPhim'),
    memberBtnHistory: document.getElementById('memberBtnHistory'),
    memberBtnLogout: document.getElementById('memberBtnLogout'),
};

// Global App State
const state = {
    activeView: 'home', // 'home', 'grid', 'library'
    
    // Grid/Filter State
    gridType: '', // 'phim-bo', 'phim-le', 'search', 'filter', 'phim-moi', 'phim-chieu-rap', 'phim-de-cu', 'top-imdb'
    gridKeyword: '',
    gridPage: 1,
    gridTotalPages: 1,
    filters: {
        genre: '',
        country: '',
        year: '',
        sort: 'modified.time'
    },

    // Cache to prevent duplicate API requests
    apiCache: new Map(),

    // User Session
    user: null
};

let lastFocusedElement = null;

function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function getImageUrl(pathValue, fallback = 'assets/logo.png', options = {}) {
    if (!pathValue) return fallback;

    if (!pathValue.startsWith('http')) {
        if (pathValue.startsWith('/')) return pathValue;
        return `${ROUTE_IMAGE}?p=${encodeURIComponent(pathValue)}`;
    }

    try {
        const sourceUrl = new URL(pathValue);
        if (sourceUrl.hostname === 'wsrv.nl') return sourceUrl.toString();

        const width = Math.max(80, Math.min(1920, Number(options.width) || 360));
        const quality = Math.max(45, Math.min(88, Number(options.quality) || 74));
        const optimizedUrl = new URL('https://wsrv.nl/');
        optimizedUrl.searchParams.set('url', sourceUrl.toString());
        optimizedUrl.searchParams.set('w', String(width));
        if (options.height) optimizedUrl.searchParams.set('h', String(Math.max(80, Math.min(1920, Number(options.height)))));
        if (options.fit) optimizedUrl.searchParams.set('fit', options.fit);
        optimizedUrl.searchParams.set('we', '1');
        optimizedUrl.searchParams.set('output', 'webp');
        optimizedUrl.searchParams.set('q', String(quality));
        return optimizedUrl.toString();
    } catch (_) {
        return fallback;
    }
}

const API_CACHE_TTL = {
    default: 10 * 60 * 1000,
    catalog: 8 * 60 * 1000,
    search: 4 * 60 * 1000,
    detail: 45 * 60 * 1000,
    images: 6 * 60 * 60 * 1000,
    taxonomy: 24 * 60 * 60 * 1000
};

const API_CACHE_STALE_TTL = {
    default: 2 * 60 * 60 * 1000,
    catalog: 24 * 60 * 60 * 1000,
    search: 30 * 60 * 1000,
    detail: 7 * 24 * 60 * 60 * 1000,
    images: 7 * 24 * 60 * 60 * 1000,
    taxonomy: 14 * 24 * 60 * 60 * 1000
};

const API_CACHE_MAX_ENTRIES = 90;

const PREFETCH_CONFIG = {
    gridPagesAhead: 0,
    maxQueueSize: 3,
    maxRequestsPerPage: 2,
    delayMs: 2500,
    dropdownPreviewLimit: 2,
    homeDeckPreviewLimit: 2,
    apiPrefetchEnabled: false,
    htmlPrefetchEnabled: false,
    imagePrefetchEnabled: false,
    passiveIntentPrefetchEnabled: false,
    nextGridPagePrefetchEnabled: false,
    tmdbHeroBackdropEnabled: false,
    autoWarmOnLoad: false,
    prefetchHtmlOnLoad: false
};

const apiInFlightRequests = new Map();
let prefetchRequestsUsed = 0;
let preferredApiCacheStorage = null;

function getConnectionInfo() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
}

function shouldUseConservativeNetworkMode() {
    const conn = getConnectionInfo();
    return Boolean(conn && (conn.saveData || /2g|3g/.test(conn.effectiveType || '')));
}

function shouldUsePassiveIntentPrefetch() {
    return PREFETCH_CONFIG.passiveIntentPrefetchEnabled && !shouldUseConservativeNetworkMode();
}

function getApiCacheTTL(endpoint) {
    if (endpoint === OP_GENRES || endpoint === OP_COUNTRIES) return API_CACHE_TTL.taxonomy;
    if (endpoint === OP_DETAILS) return API_CACHE_TTL.detail;
    if (endpoint === OP_IMAGES) return API_CACHE_TTL.images;
    if (endpoint === OP_SEARCH) return API_CACHE_TTL.search;
    if ([OP_HOME, OP_PHIM_BO, OP_PHIM_LE, OP_PHIM_CHIEU_RAP, OP_GENRE, OP_COUNTRY].includes(endpoint)) {
        return API_CACHE_TTL.catalog;
    }
    return API_CACHE_TTL.default;
}

function getApiStaleTTL(endpoint) {
    if (endpoint === OP_GENRES || endpoint === OP_COUNTRIES) return API_CACHE_STALE_TTL.taxonomy;
    if (endpoint === OP_DETAILS) return API_CACHE_STALE_TTL.detail;
    if (endpoint === OP_IMAGES) return API_CACHE_STALE_TTL.images;
    if (endpoint === OP_SEARCH) return API_CACHE_STALE_TTL.search;
    if ([OP_HOME, OP_PHIM_BO, OP_PHIM_LE, OP_PHIM_CHIEU_RAP, OP_GENRE, OP_COUNTRY].includes(endpoint)) {
        return API_CACHE_STALE_TTL.catalog;
    }
    return API_CACHE_STALE_TTL.default;
}

function getApiCacheStorage() {
    if (preferredApiCacheStorage) return preferredApiCacheStorage;

    try {
        const testKey = `${API_CACHE_PREFIX}storage_test`;
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        preferredApiCacheStorage = localStorage;
    } catch (_) {
        preferredApiCacheStorage = sessionStorage;
    }

    return preferredApiCacheStorage;
}

function forEachApiCacheStorage(callback) {
    const storages = [];
    try {
        if (localStorage) storages.push(localStorage);
    } catch (_) {}
    try {
        if (sessionStorage && !storages.includes(sessionStorage)) storages.push(sessionStorage);
    } catch (_) {}
    storages.forEach(callback);
}

function buildApiRequest(endpoint, params = {}) {
    const proxyUrl = new URL(ROUTE_CLIENT, window.location.origin);
    proxyUrl.searchParams.append('q', endpoint);
    Object.keys(params).sort().forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
            proxyUrl.searchParams.append(key === 'slug' ? 's' : key, params[key]);
        }
    });

    const url = proxyUrl.toString();
    return {
        url,
        cacheKey: API_CACHE_PREFIX + url
    };
}

function pruneApiCache(maxEntriesToRemove = 20) {
    try {
        const storage = getApiCacheStorage();
        const entries = Object.keys(storage)
            .filter(key => key.startsWith(API_CACHE_PREFIX))
            .map(key => {
                try {
                    const parsed = JSON.parse(storage.getItem(key));
                    return { key, expiresAt: Number(parsed?.expiresAt || 0), staleExpiresAt: Number(parsed?.staleExpiresAt || 0) };
                } catch (error) {
                    return { key, expiresAt: 0, staleExpiresAt: 0 };
                }
            })
            .sort((a, b) => (a.staleExpiresAt || a.expiresAt) - (b.staleExpiresAt || b.expiresAt));

        const overflow = Math.max(0, entries.length - API_CACHE_MAX_ENTRIES);
        entries.slice(0, Math.max(maxEntriesToRemove, overflow)).forEach(entry => storage.removeItem(entry.key));
    } catch (error) {
        console.warn('API cache prune failed:', error);
    }
}

function readApiCache(cacheKey, options = {}) {
    try {
        const storage = getApiCacheStorage();
        const cached = storage.getItem(cacheKey);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        const isCacheEnvelope = parsed &&
            typeof parsed === 'object' &&
            Object.prototype.hasOwnProperty.call(parsed, 'data') &&
            Object.prototype.hasOwnProperty.call(parsed, 'expiresAt');

        if (!isCacheEnvelope) {
            storage.removeItem(cacheKey);
            return null;
        }

        const currentTime = Date.now();
        const expiresAt = Number(parsed.expiresAt || 0);
        const staleExpiresAt = Number(parsed.staleExpiresAt || (expiresAt + API_CACHE_TTL.default * 6));
        const isFresh = expiresAt > currentTime;
        if (isFresh || (options.allowStale && staleExpiresAt > currentTime)) return parsed.data;

        if (staleExpiresAt <= currentTime) storage.removeItem(cacheKey);
        return null;
    } catch (error) {
        console.warn('API cache read failed:', error);
        return null;
    }
}

function writeApiCache(cacheKey, data, endpoint) {
    try {
        const storage = getApiCacheStorage();
        const currentTime = Date.now();
        const freshTtl = getApiCacheTTL(endpoint);
        const payload = {
            cachedAt: currentTime,
            expiresAt: currentTime + freshTtl,
            staleExpiresAt: currentTime + freshTtl + getApiStaleTTL(endpoint),
            data
        };
        storage.setItem(cacheKey, JSON.stringify(payload));
        pruneApiCache(0);
    } catch (error) {
        pruneApiCache();
        try {
            const storage = getApiCacheStorage();
            const currentTime = Date.now();
            const freshTtl = getApiCacheTTL(endpoint);
            storage.setItem(cacheKey, JSON.stringify({
                cachedAt: currentTime,
                expiresAt: currentTime + freshTtl,
                staleExpiresAt: currentTime + freshTtl + getApiStaleTTL(endpoint),
                data
            }));
        } catch (retryError) {
            console.warn('API cache write failed:', retryError);
        }
    }
}

function getCachedApiData(endpoint, params = {}, options = {}) {
    const { cacheKey } = buildApiRequest(endpoint, params);
    return readApiCache(cacheKey, options);
}

function createPlayerUrl(slug, episodeIndex = 0, serverIndex = 0) {
    const playerUrl = new URL(ROUTE_PLAYER, window.location.origin);
    playerUrl.searchParams.set('slug', slug);
    playerUrl.searchParams.set('ep', String(Math.max(0, Number.parseInt(episodeIndex, 10) || 0)));
    playerUrl.searchParams.set('sv', String(Math.max(0, Number.parseInt(serverIndex, 10) || 0)));
    return `${playerUrl.pathname}${playerUrl.search}`;
}

function getEpisodeText(value = '') {
    return String(value || '').trim();
}

function isPlaceholderEpisode(episode) {
    if (!episode) return true;
    return !getEpisodeText(episode.name) &&
        !getEpisodeText(episode.slug) &&
        !getEpisodeText(episode.filename);
}

function getMoviePlaybackState(movie, episodeIndex = 0, serverIndex = 0) {
    const episodes = Array.isArray(movie?.episodes) ? movie.episodes : [];
    const currentServer = episodes.length > serverIndex ? episodes[serverIndex] : null;
    const serverData = Array.isArray(currentServer?.server_data) ? currentServer.server_data : [];
    const currentEpisode = serverData.length > episodeIndex ? serverData[episodeIndex] : null;
    const hasEpisodeMetadata = episodes.some(server => {
        const data = Array.isArray(server?.server_data) ? server.server_data : [];
        return data.some(episode => !isPlaceholderEpisode(episode));
    });

    return {
        episodes,
        currentServer,
        serverData,
        currentEpisode,
        isUnavailable: !hasEpisodeMetadata || isPlaceholderEpisode(currentEpisode)
    };
}

function renderPlayerUnavailableBlock(options = {}) {
    const actionHtml = options.actionHtml || '';
    return `
        <div class="no-results player-unavailable" style="height:100%; border:none; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <i data-lucide="clock" style="width:48px; height:48px; color:var(--text-muted);"></i>
            <p style="margin-top:10px;">${PLAYER_UPDATE_MESSAGE}</p>
            ${actionHtml}
        </div>
    `;
}

function createPlayerFrameHTML(playerUrl) {
    return `
        <div class="player-frame-shell" data-player-shell>
            <iframe data-player-frame src="${escapeHTML(playerUrl)}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="same-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"></iframe>
            <div class="player-loading-overlay" data-player-loading role="status" aria-live="polite">
                <p>Đang tải phim...</p>
            </div>
        </div>
    `;
}

function bindPlayerFrameLoader(root) {
    const shell = root?.querySelector?.('[data-player-shell]');
    const frame = shell?.querySelector?.('[data-player-frame]');
    const overlay = shell?.querySelector?.('[data-player-loading]');
    if (!shell || !frame || !overlay) return;

    let overlayHidden = false;
    let errorShown = false;
    const overlayText = overlay.querySelector('p');

    const cleanup = () => {
        window.removeEventListener('message', handlePlayerMessage);
        clearTimeout(slowTimer);
        clearTimeout(fallbackTimer);
        clearTimeout(cleanupTimer);
    };

    const clearLoadingTimers = () => {
        clearTimeout(slowTimer);
        clearTimeout(fallbackTimer);
    };

    const hideLoading = () => {
        if (overlayHidden || errorShown) return;
        overlayHidden = true;
        shell.classList.add('is-ready');
        clearLoadingTimers();
    };

    const showError = message => {
        if (errorShown) return;
        errorShown = true;
        overlayHidden = false;
        shell.classList.remove('is-ready');
        overlay.classList.add('is-error');
        overlay.innerHTML = `
            <i data-lucide="clock" style="width:46px; height:46px;"></i>
            <p>${escapeHTML(message || PLAYER_UPDATE_MESSAGE)}</p>
        `;
        shell.classList.add('has-player-error');
        cleanup();
        lucide.createIcons();
    };

    function handlePlayerMessage(event) {
        if (event.origin !== window.location.origin || event.source !== frame.contentWindow) return;
        const type = event.data?.type;
        if (type === 'qc-player-ready') {
            hideLoading();
        } else if (type === 'qc-player-error') {
            showError(event.data?.message || PLAYER_UPDATE_MESSAGE);
        } else if (type === 'qc-player-loading' && overlayText && !overlayHidden) {
            overlayText.textContent = 'Đang tải phim...';
        }
    }

    const slowTimer = setTimeout(() => {
        if (!overlayHidden && !errorShown && overlayText) overlayText.textContent = 'Phim đang tải, vui lòng chờ...';
    }, 9000);
    const fallbackTimer = setTimeout(hideLoading, 6000);
    const cleanupTimer = setTimeout(cleanup, 60000);

    frame.addEventListener('error', () => showError(PLAYER_UPDATE_MESSAGE), { once: true });
    frame.addEventListener('load', () => {
        window.setTimeout(hideLoading, 150);
    }, { once: true });
    window.addEventListener('message', handlePlayerMessage);
}

function warmMovieIntent(movie, options = {}) {
    if (!movie || !movie.slug) return;

    const params = { slug: movie.slug };
    if (options.immediate) {
        fetchAPI(OP_DETAILS, params);
        if (options.includeTmdbImages) fetchAPI(OP_IMAGES, params);
    } else {
        queueApiPrefetch(OP_DETAILS, params, { priority: options.priority || 9 });
        if (options.includeTmdbImages) {
            queueApiPrefetch(OP_IMAGES, params, { priority: Math.max(1, (options.priority || 9) - 1) });
        }
    }

    if (options.withPosterImages) {
        if (movie.poster_url) prefetchImage(movie.poster_url);
        if (movie.thumb_url) prefetchImage(movie.thumb_url);
    }
}

function purgeLegacyApiCache() {
    try {
        forEachApiCacheStorage(storage => {
            Object.keys(storage).forEach(key => {
                if (key.startsWith('qc_cache_') && !key.startsWith(API_CACHE_PREFIX)) {
                    storage.removeItem(key);
                }
            });
        });
    } catch (error) {
        console.warn('Legacy API cache cleanup failed:', error);
    }
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.app-toast');
    if (existing) existing.remove();

    const toastIcons = {
        error: 'alert-circle',
        remove: 'trash-2',
        'history-remove': 'history',
        success: 'check-circle-2',
        info: 'check-circle-2'
    };
    const iconName = toastIcons[type] || toastIcons.info;

    const toast = document.createElement('div');
    toast.className = `app-toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${escapeHTML(message)}</span>
    `;
    document.body.appendChild(toast);
    lucide.createIcons();

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 2800);
}

function setWatchlistButtonState(button, isInWatchlist, slug = '') {
    if (!button) return;

    const icon = button.querySelector('[data-lucide]') || button.querySelector('i');
    const label = button.querySelector('span');

    if (slug) button.dataset.slug = slug;
    button.className = isInWatchlist ? 'watchlist-toggle-btn in-watchlist btn' : 'watchlist-toggle-btn btn';
    if (label) label.textContent = isInWatchlist ? 'Đã lưu yêu thích' : 'Thêm vào yêu thích';
    if (icon) icon.setAttribute('data-lucide', isInWatchlist ? 'check-circle-2' : 'heart');

    button.onmouseenter = () => {
        if (!libraryManager.isInWatchlist(button.dataset.slug || '')) return;
        if (label) label.textContent = 'Bỏ yêu thích';
        if (icon) icon.setAttribute('data-lucide', 'trash-2');
        lucide.createIcons();
    };

    button.onmouseleave = () => {
        if (!libraryManager.isInWatchlist(button.dataset.slug || '')) return;
        if (label) label.textContent = 'Đã lưu yêu thích';
        if (icon) icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
    };

    lucide.createIcons();
}

function createCardSkeletons(count = 12, row = false) {
    return Array.from({ length: count }, () => `
        <div class="movie-card skeleton-card ${row ? 'row-skeleton' : ''}" aria-hidden="true">
            <div class="movie-poster-container"></div>
            <div class="movie-info">
                <div class="skeleton-line wide"></div>
                <div class="skeleton-line short"></div>
            </div>
        </div>
    `).join('');
}

function initClientSecurityDeterrents() {
    if (window.__qcSecurityDeterrentsReady) return;
    window.__qcSecurityDeterrentsReady = true;

    // Browser-side DevTools detection is easy to bypass and can misidentify
    // resized, split-screen or embedded browsers. Security remains enforced by
    // CSP, same-origin API checks, allowlists and server-side rate limits.
    return;

    const lockStorageKey = 'qc_security_lock_until';
    const lockBroadcastKey = 'qc_security_lock_ping';
    const serverLockEndpoint = '/api/security-lock';
    const serverSignalReportingEnabled = window.__QC_ENABLE_SECURITY_SIGNAL_REPORTING === true;
    const hardLockPath = '/security-locked';
    const lockDuration = 60000;
    const serverLockDuration = 120000;
    const serverSignalReportCooldown = 30000;
    const checkInterval = 2500;
    const consoleInspectionDetectionEnabled = window.__QC_ENABLE_CONSOLE_INSPECTION_DETECT === true;
    const shieldMarkup = '<div><strong style="display:block;font-size:clamp(22px,4vw,34px);font-weight:800">Trang đã tạm khóa</strong><p style="margin:12px 0 0;color:#cbd5e1;font-size:16px;line-height:1.55">Đóng công cụ kiểm tra để tiếp tục sử dụng website.</p></div>';
    const hardLockMarkup = '<main class="qc-hardlock-shell" role="alert" aria-live="assertive"><section><div class="qc-hardlock-mark">LOCKED</div><h1>Trang đã bị khóa</h1><p>Hệ thống đã phát hiện công cụ kiểm tra hoặc hành vi khai thác. Đóng các công cụ này và tải lại trang sau ít phút.</p></section></main>';
    const hardLockCss = 'html,body{width:100%;height:100%;margin:0;background:#05070d;color:#f8fafc;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}.qc-hardlock-shell{min-height:100%;display:grid;place-items:center;padding:24px;box-sizing:border-box;text-align:center}.qc-hardlock-shell section{max-width:560px}.qc-hardlock-mark{display:inline-grid;place-items:center;height:34px;padding:0 12px;border:1px solid rgba(248,113,113,.55);color:#fecaca;background:rgba(127,29,29,.35);font-size:12px;font-weight:800;letter-spacing:.14em;margin-bottom:18px}h1{font-size:clamp(28px,6vw,48px);line-height:1.05;margin:0 0 14px}p{margin:0;color:#cbd5e1;font-size:16px;line-height:1.65}';
    const shieldStyles = [
        'position:fixed',
        'inset:0',
        'z-index:2147483647',
        'display:grid',
        'place-items:center',
        'background:#05070d',
        'color:#f8fafc',
        'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        'text-align:center',
        'padding:24px',
        'box-sizing:border-box',
        'pointer-events:auto',
        'user-select:none'
    ].join(';');

    let warningShown = false;
    let playerLocked = false;
    let pageShield = null;
    let lastDevtoolsSignalAt = 0;
    let recoveryTimer = null;
    let viewportSignalCount = 0;
    let consoleSignalCount = 0;
    let inMemoryLockUntil = 0;
    let lastSignalReportAt = 0;
    let hardLockRedirectTimer = null;
    let capturedPageStyles = false;
    let previousRootOverflow = '';
    let previousBodyOverflow = '';
    let previousBodyUserSelect = '';
    let limitedActionWarningShown = false;

    const now = () => Date.now();

    const readStoredLockUntil = () => {
        try {
            const lockUntil = Number(localStorage.getItem(lockStorageKey));
            return Number.isFinite(lockUntil) ? lockUntil : 0;
        } catch (_) {
            return 0;
        }
    };

    const hasActiveStoredLock = () => Math.max(readStoredLockUntil(), inMemoryLockUntil) > now();

    const writeStoredLock = (duration = lockDuration) => {
        const lockUntil = now() + duration;
        inMemoryLockUntil = Math.max(inMemoryLockUntil, lockUntil);
        try {
            localStorage.setItem(lockStorageKey, String(lockUntil));
            localStorage.setItem(lockBroadcastKey, String(lockUntil));
        } catch (_) {}
        return lockUntil;
    };

    const reportSecuritySignal = (reason = 'devtools') => {
        const currentTime = now();
        inMemoryLockUntil = Math.max(inMemoryLockUntil, currentTime + serverLockDuration);

        if (!serverSignalReportingEnabled) return;
        if (currentTime - lastSignalReportAt < serverSignalReportCooldown) return;
        lastSignalReportAt = currentTime;

        const endpoint = `${serverLockEndpoint}?reason=${encodeURIComponent(reason)}&s=${Math.ceil(serverLockDuration / 1000)}`;
        try {
            if (navigator.sendBeacon) {
                const payload = new Blob(['1'], { type: 'text/plain' });
                if (navigator.sendBeacon(endpoint, payload)) return;
            }
        } catch (_) {}

        try {
            fetch(endpoint, {
                method: 'POST',
                cache: 'no-store',
                credentials: 'same-origin',
                keepalive: true,
                referrerPolicy: 'same-origin',
                headers: {
                    'X-QC-Security-Signal': reason
                }
            }).catch(() => {});
        } catch (_) {}
    };

    const isHardLockPage = () => {
        try {
            return window.location.pathname.replace(/\/+$/, '') === hardLockPath;
        } catch (_) {
            return false;
        }
    };

    const scrubCurrentDocument = () => {
        try {
            document.querySelectorAll('video, audio').forEach(media => {
                try {
                    media.pause();
                    media.removeAttribute('src');
                    media.load();
                } catch (_) {}
            });
            document.querySelectorAll('iframe, embed, object').forEach(embed => embed.remove());
            document.querySelectorAll('script, link[rel="stylesheet"], style').forEach(node => node.remove());
            if (document.head) {
                document.head.innerHTML = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>Trang đã bị khóa</title>';
                const style = document.createElement('style');
                style.textContent = hardLockCss;
                document.head.appendChild(style);
            }
            if (document.body) {
                document.body.removeAttribute('class');
                document.body.innerHTML = hardLockMarkup;
                document.body.dataset.securityLocked = '1';
            }
            try {
                forEachApiCacheStorage(storage => {
                    Object.keys(storage).forEach(key => {
                        if (key.startsWith(API_CACHE_PREFIX)) storage.removeItem(key);
                    });
                });
            } catch (_) {}
        } catch (_) {}
    };

    const scheduleHardLockRedirect = (reason = 'devtools') => {
        if (isHardLockPage() || hardLockRedirectTimer) return;
        scrubCurrentDocument();
        hardLockRedirectTimer = setTimeout(() => {
            try {
                const target = `${hardLockPath}?r=${encodeURIComponent(reason)}&t=${now()}`;
                window.location.replace(target);
            } catch (_) {
                window.location.href = hardLockPath;
            }
        }, 80);
    };

    const clearStoredLockIfExpired = () => {
        try {
            const lockUntil = readStoredLockUntil();
            if (!lockUntil || lockUntil <= now()) {
                localStorage.removeItem(lockStorageKey);
            }
        } catch (_) {}
    };

    const warnOnce = (message = 'Trang đã tạm khóa do phát hiện công cụ kiểm tra.') => {
        if (warningShown) return;
        warningShown = true;
        showToast(message, 'error');
        setTimeout(() => {
            warningShown = false;
        }, 3500);
    };

    const warnLimitedAction = () => {
        if (limitedActionWarningShown) return;
        limitedActionWarningShown = true;
        showToast('Tính năng này đang được hạn chế để bảo vệ nội dung.', 'error');
        setTimeout(() => {
            limitedActionWarningShown = false;
        }, 2500);
    };

    const lockEmbeddedContent = () => {
        const embeds = document.querySelectorAll('iframe, embed, object');
        embeds.forEach(embed => {
            if (embed.dataset.securityLocked === '1') return;
            embed.dataset.securityLocked = '1';

            if (embed.tagName === 'OBJECT') {
                embed.dataset.previousData = embed.getAttribute('data') || '';
                embed.removeAttribute('data');
            } else {
                embed.dataset.previousSrc = embed.getAttribute('src') || '';
                embed.setAttribute('src', 'about:blank');
            }
        });

        document.querySelectorAll('video, audio').forEach(media => {
            try {
                media.pause();
            } catch (_) {}
        });

        playerLocked = embeds.length > 0;
    };

    const restoreEmbeddedContent = () => {
        const embeds = document.querySelectorAll('[data-security-locked="1"]');
        embeds.forEach(embed => {
            if (embed.tagName === 'OBJECT') {
                const previousData = embed.dataset.previousData;
                if (previousData) embed.setAttribute('data', previousData);
                delete embed.dataset.previousData;
            } else {
                const previousSrc = embed.dataset.previousSrc;
                if (previousSrc) embed.setAttribute('src', previousSrc);
                delete embed.dataset.previousSrc;
            }
            delete embed.dataset.securityLocked;
        });
        playerLocked = false;
    };

    const ensureShieldMounted = () => {
        if (!pageShield || !document.body) return;
        pageShield.id = 'qcSecurityShield';
        pageShield.setAttribute('role', 'alert');
        pageShield.setAttribute('aria-live', 'assertive');
        if (pageShield.innerHTML !== shieldMarkup) pageShield.innerHTML = shieldMarkup;
        pageShield.style.cssText = shieldStyles;
        if (!document.body.contains(pageShield)) {
            document.body.appendChild(pageShield);
        }
    };

    const blockedEvents = [
        'click',
        'dblclick',
        'mousedown',
        'mouseup',
        'pointerdown',
        'pointerup',
        'touchstart',
        'touchend',
        'submit',
        'copy',
        'cut',
        'paste',
        'drop',
        'wheel'
    ];

    const showPageShield = () => {
        lockEmbeddedContent();
        if (!document.body) return;

        if (!pageShield) {
            pageShield = document.createElement('div');
            pageShield.innerHTML = shieldMarkup;
        }

        if (!capturedPageStyles) {
            previousRootOverflow = document.documentElement.style.overflow;
            previousBodyOverflow = document.body.style.overflow;
            previousBodyUserSelect = document.body.style.userSelect;
            capturedPageStyles = true;
        }

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.userSelect = 'none';
        document.body.dataset.securityLocked = '1';
        ensureShieldMounted();
        
        // Dynamically register interaction-blocking event listeners
        blockedEvents.forEach(type => {
            document.addEventListener(type, blockLockedInteraction, { capture: true, passive: false });
        });
    };

    const hidePageShield = () => {
        if (pageShield) {
            pageShield.remove();
            pageShield = null;
        }
        if (document.body) {
            if (capturedPageStyles) {
                document.documentElement.style.overflow = previousRootOverflow;
                document.body.style.overflow = previousBodyOverflow;
                document.body.style.userSelect = previousBodyUserSelect;
            } else {
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                document.body.style.userSelect = '';
            }
            delete document.body.dataset.securityLocked;
        }
        capturedPageStyles = false;
        restoreEmbeddedContent();
        
        // Dynamically remove interaction-blocking event listeners
        blockedEvents.forEach(type => {
            document.removeEventListener(type, blockLockedInteraction, { capture: true });
        });
    };

    const activateSecurityLock = (duration = lockDuration, reason = 'devtools') => {
        lastDevtoolsSignalAt = now();
        writeStoredLock(duration);
        reportSecuritySignal(reason);
        showPageShield();
        warnOnce();
        scheduleHardLockRedirect(reason);
    };

    const hasLocalDevtoolsSignal = () => {
        const dockedSignal = detectDockedDevtools();
        if (dockedSignal) {
            return true;
        }

        return consoleInspectionDetectionEnabled && detectConsoleInspection();
    };

    const scheduleRecoveryCheck = (delay = 250) => {
        clearTimeout(recoveryTimer);
        recoveryTimer = setTimeout(() => {
            clearStoredLockIfExpired();
            if (pageShield && !hasActiveStoredLock() && !hasLocalDevtoolsSignal()) {
                hidePageShield();
            }
        }, delay);
    };

    const blockLockedInteraction = event => {
        if (!pageShield) return;
        event.preventDefault();
        event.stopImmediatePropagation();
    };

    document.addEventListener('contextmenu', event => {
        if (event.target?.closest?.('input, textarea, [contenteditable="true"]')) return;
        event.preventDefault();
        warnLimitedAction();
    }, true);

    document.addEventListener('dragstart', event => {
        if (event.target.closest('img, video, iframe, .video-container')) {
            event.preventDefault();
        }
    }, true);

    document.addEventListener('keydown', event => {
        if (pageShield) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
        }

        const key = String(event.key || '').toLowerCase();
        const blockedShortcut =
            event.key === 'F12' ||
            (event.ctrlKey && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) ||
            (event.metaKey && event.altKey && ['i', 'j', 'c', 'k'].includes(key)) ||
            (event.ctrlKey && ['u', 's'].includes(key)) ||
            (event.metaKey && ['u', 's'].includes(key));

        if (!blockedShortcut) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        activateSecurityLock(lockDuration, 'shortcut');
    }, true);

    const detectDockedDevtools = () => {
        if (document.visibilityState === 'hidden') return false;
        const widthGap = Math.abs(window.outerWidth - window.innerWidth);
        const heightGap = Math.abs(window.outerHeight - window.innerHeight);
        const widthThreshold = Math.max(160, Math.round(window.outerWidth * 0.14));
        const heightThreshold = Math.max(150, Math.round(window.outerHeight * 0.14));
        const strongGap = widthGap > widthThreshold * 1.45 || heightGap > heightThreshold * 1.45;
        const hasLargeGap = widthGap > widthThreshold || heightGap > heightThreshold;
        viewportSignalCount = hasLargeGap ? Math.min(viewportSignalCount + 1, 4) : Math.max(viewportSignalCount - 1, 0);
        return strongGap || viewportSignalCount >= 2;
    };

    const detectConsoleInspection = () => {
        if (document.visibilityState === 'hidden') return false;

        let inspected = false;
        const probe = new Image();
        Object.defineProperty(probe, 'id', {
            get() {
                inspected = true;
                return ' ';
            }
        });

        try {
            console.log(probe);
        } catch (_) {
            inspected = false;
        }

        consoleSignalCount = inspected
            ? Math.min(consoleSignalCount + 1, 3)
            : Math.max(consoleSignalCount - 1, 0);

        return consoleSignalCount >= 3;
    };

    const suspiciousResourcePattern = /^(?:devtools:|chrome-extension:|moz-extension:|ms-browser-extension:|safari-web-extension:)/i;

    const getNodeResourceUrl = node => {
        if (!node || node.nodeType !== 1) return '';
        if (node.matches('script[src], iframe[src], embed[src]')) return node.getAttribute('src') || '';
        if (node.matches('link[href]')) return node.getAttribute('href') || '';
        if (node.matches('object[data]')) return node.getAttribute('data') || '';
        return '';
    };

    const scanSuspiciousResources = root => {
        const nodes = [];
        if (root && root.nodeType === 1) nodes.push(root);
        try {
            root?.querySelectorAll?.('script[src], iframe[src], embed[src], link[href], object[data]').forEach(node => nodes.push(node));
        } catch (_) {}

        return nodes.some(node => suspiciousResourcePattern.test(getNodeResourceUrl(node).trim()));
    };

    const evaluateSecurityState = () => {
        clearStoredLockIfExpired();
        const devtoolsLikelyOpen = hasLocalDevtoolsSignal();

        if (devtoolsLikelyOpen) {
            activateSecurityLock();
        } else if (hasActiveStoredLock()) {
            lastDevtoolsSignalAt = now();
            showPageShield();
            scheduleHardLockRedirect('stored-lock');
        } else if ((playerLocked || pageShield) && now() - lastDevtoolsSignalAt > 900) {
            hidePageShield();
        }
    };

    try {
        const observerTarget = document.body || document.documentElement;
        const shieldObserver = new MutationObserver(() => {
            if (pageShield) ensureShieldMounted();
        });
        shieldObserver.observe(observerTarget, { childList: true });
    } catch (_) {}

    try {
        const observerTarget = document.documentElement;
        const resourceObserver = new MutationObserver(mutations => {
            const hasSuspiciousMutation = mutations.some(mutation => {
                if (mutation.type === 'attributes') return scanSuspiciousResources(mutation.target);
                return Array.from(mutation.addedNodes || []).some(scanSuspiciousResources);
            });
            if (hasSuspiciousMutation) activateSecurityLock(lockDuration, 'devtools-resource');
        });
        resourceObserver.observe(observerTarget, {
            attributes: true,
            attributeFilter: ['src', 'href', 'data'],
            childList: true,
            subtree: true
        });
    } catch (_) {}

    document.addEventListener('securitypolicyviolation', event => {
        const blockedURI = String(event.blockedURI || '');
        if (!blockedURI || blockedURI === 'inline') return;
        if (suspiciousResourcePattern.test(blockedURI)) activateSecurityLock(lockDuration, 'devtools-resource');
    });

    evaluateSecurityState();
    setInterval(evaluateSecurityState, checkInterval);
    window.addEventListener('focus', evaluateSecurityState);
    window.addEventListener('resize', evaluateSecurityState);
    window.addEventListener('pageshow', evaluateSecurityState);
    window.addEventListener('storage', event => {
        if (![lockStorageKey, lockBroadcastKey].includes(event.key)) return;
        if (Number(event.newValue) > now()) {
            showPageShield();
            warnOnce();
            scheduleHardLockRedirect('shared-lock');
            scheduleRecoveryCheck(lockDuration);
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') evaluateSecurityState();
        scheduleRecoveryCheck(150);
    });
    document.addEventListener('pointermove', () => {
        if (pageShield) scheduleRecoveryCheck(150);
    }, true);
}

initClientSecurityDeterrents();

const introPreloader = {
    sessionKey: 'qc_intro_seen_v1',
    assetSrc: 'https://wsrv.nl/?url=quanchillphim.vercel.app/assets/logo-loading.png&w=358&output=webp&q=80',
    minDuration: 150,
    maxWait: 2500,
    reducedMinDuration: 0,
    reducedMaxWait: 800,

    start(pageReadyPromise, targetUrl) {
        const loader = document.getElementById('qcIntroLoader');
        if (!loader) return Promise.resolve(pageReadyPromise).catch(() => {});

        if (!this.shouldShow(targetUrl)) {
            loader.remove();
            return Promise.resolve(pageReadyPromise).catch(() => {});
        }

        document.body.classList.add('qc-intro-lock');
        const reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const minDelay = this.delay(reduceMotion ? this.reducedMinDuration : this.minDuration);
        const timeoutDelay = this.delay(reduceMotion ? this.reducedMaxWait : this.maxWait);

        const coreReady = Promise.allSettled([
            this.preloadLogo(),
            Promise.resolve(pageReadyPromise)
        ]);

        return Promise.allSettled([
            minDelay,
            Promise.race([coreReady, timeoutDelay])
        ]).then(() => {
            this.finish(loader);
        });
    },

    shouldShow(targetUrl) {
        if (!this.isHomeUrl(targetUrl)) return false;
        try {
            return sessionStorage.getItem(this.sessionKey) !== '1';
        } catch (error) {
            return true;
        }
    },

    isHomeUrl(targetUrl) {
        const pathName = targetUrl.pathname.split('/').pop().replace(/\.html$/, '').replace(/\.min$/, '');
        return !pathName || pathName === 'index';
    },

    preloadLogo() {
        return new Promise(resolve => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = resolve;
            image.src = this.assetSrc;
            if (image.decode) {
                image.decode().then(resolve).catch(resolve);
            }
        });
    },

    waitForFonts() {
        if (!document.fonts || !document.fonts.ready) return Promise.resolve();
        return document.fonts.ready.catch(() => {});
    },

    delay(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    },

    finish(loader) {
        try {
            sessionStorage.setItem(this.sessionKey, '1');
        } catch (error) {
            // Session storage can be blocked; the intro should still exit.
        }

        loader.classList.add('is-complete');
        document.body.classList.remove('qc-intro-lock');
        setTimeout(() => loader.remove(), 650);
    }
};

// =========================================================================
// INITIALIZATION
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    purgeLegacyApiCache();
    themeManager.init();
    libraryManager.init();
    sessionManager.init();
    initScrollEffects();
    initClientSecurityDeterrents();
    
    // Initial DOM binding & dynamic/static event listeners
    updateDOMReferences();
    syncNavIndicator({ immediate: true });
    initStaticEventListeners();
    initDynamicPageEventListeners();
    
    populateNavDropdowns();
    initGSAPAnimations();

    // Initial page routing
    const targetUrl = new URL(window.location.href);
    const initialPageReady = runPageRouting(targetUrl);
    introPreloader.start(initialPageReady, targetUrl);
});

// =========================================================================
// API CORE SERVICE
// =========================================================================
async function fetchApiFromNetwork(url, cacheKey, endpoint) {
    const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin',
        referrerPolicy: 'same-origin'
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();

    if (data && (data.status === 'success' || data.status === true || data.data)) {
        writeApiCache(cacheKey, data, endpoint);
    }

    return data;
}

async function fetchAPI(endpoint, params = {}) {
    const { url, cacheKey } = buildApiRequest(endpoint, params);

    try {
        const cached = readApiCache(cacheKey);
        if (cached) return cached;

        const stale = readApiCache(cacheKey, { allowStale: true });

        if (apiInFlightRequests.has(cacheKey)) {
            return stale || apiInFlightRequests.get(cacheKey);
        }

        const requestPromise = fetchApiFromNetwork(url, cacheKey, endpoint);

        apiInFlightRequests.set(cacheKey, requestPromise);
        requestPromise.finally(() => {
            apiInFlightRequests.delete(cacheKey);
        }).catch(() => {});

        if (stale) return stale;

        try {
            return await requestPromise;
        } finally {
            apiInFlightRequests.delete(cacheKey);
        }
    } catch (error) {
        console.error('API Fetch Error:', error);
        return readApiCache(cacheKey, { allowStale: true }) || null;
    }
}

// =========================================================================
// THEME MANAGER (DARK / LIGHT MODE)
// =========================================================================
const themeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        
        elements.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    },
    setTheme(theme) {
        const normalizedTheme = theme === 'light' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', normalizedTheme);
        localStorage.setItem('theme', normalizedTheme);

        // Keep browser chrome and assistive technology in sync with the
        // selected theme instead of leaving the dark-mode metadata behind.
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.setAttribute('content', normalizedTheme === 'light' ? '#f4f0e8' : '#0a0c14');
        }

        if (elements.themeToggle) {
            const isLight = normalizedTheme === 'light';
            elements.themeToggle.setAttribute('aria-pressed', String(isLight));
            elements.themeToggle.setAttribute('title', isLight ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng');
            elements.themeToggle.setAttribute('aria-label', isLight ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng');
        }
    }
};

// =========================================================================
// LOCALSTORAGE LIBRARY MANAGER (WATCHLIST & WATCH HISTORY)
// =========================================================================
const libraryManager = {
    init() {
        this.updateLibraryCounters();
        
        // Tab buttons functionality
        const libTabs = document.querySelectorAll('.lib-tab-btn');
        libTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                libTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const selectedTab = tab.getAttribute('data-tab');
                if (selectedTab === 'watchlist') {
                    elements.watchlistPanel.classList.remove('hidden');
                    elements.historyPanel.classList.add('hidden');
                    this.renderWatchlist();
                } else {
                    elements.watchlistPanel.classList.add('hidden');
                    elements.historyPanel.classList.remove('hidden');
                    this.renderHistory();
                }
            });
        });
    },

    // --- Watchlist ---
    getWatchlist() {
        return JSON.parse(localStorage.getItem('watchlist')) || [];
    },
    addToWatchlist(movie) {
        const watchlist = this.getWatchlist();
        if (!watchlist.some(m => m.slug === movie.slug)) {
            watchlist.unshift({
                slug: movie.slug,
                name: movie.name,
                origin_name: movie.origin_name,
                thumb_url: movie.thumb_url,
                year: movie.year,
                quality: movie.quality || 'HD',
                lang: movie.lang || 'Vietsub',
                time: movie.time,
                addedAt: Date.now()
            });
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            this.updateLibraryCounters();
        }
    },
    removeFromWatchlist(slug) {
        let watchlist = this.getWatchlist();
        watchlist = watchlist.filter(m => m.slug !== slug);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        this.updateLibraryCounters();
    },
    isInWatchlist(slug) {
        return this.getWatchlist().some(m => m.slug === slug);
    },

    // --- Watch History ---
    getHistory() {
        return JSON.parse(localStorage.getItem('watchHistory')) || [];
    },
    addToHistory(movie, epName, epIndex, serverIndex) {
        const history = this.getHistory();
        const filteredHistory = history.filter(h => h.slug !== movie.slug);
        
        filteredHistory.unshift({
            slug: movie.slug,
            name: movie.name,
            origin_name: movie.origin_name,
            thumb_url: movie.thumb_url,
            episodeName: epName,
            episodeIndex: epIndex,
            serverIndex: serverIndex,
            watchedAt: Date.now()
        });
        
        // Limit to 50 items
        if (filteredHistory.length > 50) filteredHistory.pop();
        
        localStorage.setItem('watchHistory', JSON.stringify(filteredHistory));
        this.updateLibraryCounters();
    },
    removeFromHistory(slug) {
        let history = this.getHistory();
        const removedItem = history.find(h => h.slug === slug);
        history = history.filter(h => h.slug !== slug);
        localStorage.setItem('watchHistory', JSON.stringify(history));
        this.updateLibraryCounters();
        this.renderHistory();
        if (removedItem) showToast('Đã xóa khỏi danh sách đang xem.', 'history-remove');
    },

    // --- Counters & Renders ---
    updateLibraryCounters() {
        if (elements.countWatchlist) elements.countWatchlist.textContent = this.getWatchlist().length;
        if (elements.countHistory) elements.countHistory.textContent = this.getHistory().length;
    },
    renderWatchlist() {
        const watchlist = this.getWatchlist();
        elements.watchlistGrid.innerHTML = '';
        
        if (watchlist.length === 0) {
            elements.watchlistGrid.classList.add('hidden');
            elements.watchlistEmpty.classList.remove('hidden');
            return;
        }
        
        elements.watchlistGrid.classList.remove('hidden');
        elements.watchlistEmpty.classList.add('hidden');
        
        watchlist.forEach(movie => {
            const card = createMovieCardHTML(movie);
            elements.watchlistGrid.appendChild(card);
        });
        
        lucide.createIcons();
    },
    renderHistory() {
        const history = this.getHistory();
        elements.historyList.innerHTML = '';
        
        if (history.length === 0) {
            elements.historyList.classList.add('hidden');
            elements.historyEmpty.classList.remove('hidden');
            return;
        }
        
        elements.historyList.classList.remove('hidden');
        elements.historyEmpty.classList.add('hidden');
        
        history.forEach(item => {
            const thumbUrl = getImageUrl(item.thumb_url, 'assets/logo.png', { width: 160, quality: 70 });
            const timeAgo = formatTimeAgo(item.watchedAt);
            
            const row = document.createElement('div');
            row.className = 'history-item';
            row.innerHTML = `
                <img src="${thumbUrl}" alt="${escapeHTML(item.name)}" class="history-thumb" loading="lazy" decoding="async" onerror="this.src='assets/logo.png';">
                <div class="history-details">
                    <span class="history-title">${escapeHTML(item.name)}</span>
                    <span class="history-ep">Tập đang xem: ${escapeHTML(item.episodeName)}</span>
                    <span class="history-time"><i data-lucide="clock"></i>Xem ${timeAgo}</span>
                </div>
                <div class="history-actions-buttons">
                    <button class="history-btn-play" title="Xem tiếp" aria-label="Xem tiếp ${escapeHTML(item.name)}">
                        <i data-lucide="play"></i>
                    </button>
                    <button class="history-btn-delete" title="Xóa khỏi lịch sử" aria-label="Xóa ${escapeHTML(item.name)} khỏi lịch sử">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
            row.querySelector('.history-btn-play').addEventListener('click', () => {
                playMovieFromSlug(item.slug, item.episodeIndex, item.serverIndex);
            });
            row.querySelector('.history-btn-delete').addEventListener('click', () => {
                libraryManager.removeFromHistory(item.slug);
            });
            elements.historyList.appendChild(row);
        });
        
        lucide.createIcons();
    }
};

// =========================================================================
// ROUTING / VIEW NAVIGATION
// =========================================================================
function switchView(viewName) {
    state.activeView = viewName;
    
    // Close any active modals on page switch
    if (elements.movieModal && elements.movieModal.classList.contains('active')) {
        closeModal();
    }
    if (elements.playerModal && elements.playerModal.classList.contains('active')) {
        closePlayerModal();
    }
    
    // Toggle active classes on Navlinks
    const links = [
        elements.navTrangChu, elements.navPhimBo, elements.navPhimLe, elements.navTuPhim,
        elements.navPhimMoi, elements.navPhimChieuRap, elements.navPhimDeCu, elements.navTopIMDb
    ];
    links.forEach(l => {
        if (l) l.classList.remove('active');
    });
    
    const pages = [elements.homePage, elements.gridViewPage, elements.libraryPage];
    const hero = elements.heroSection;
    
    let targetPage = null;
    if (viewName === 'home') {
        elements.navTrangChu.classList.add('active');
        targetPage = elements.homePage;
    } else if (viewName === 'grid') {
        if (state.gridType === 'phim-bo') elements.navPhimBo.classList.add('active');
        else if (state.gridType === 'phim-le') elements.navPhimLe.classList.add('active');
        else if (state.gridType === 'phim-chieu-rap') elements.navPhimChieuRap.classList.add('active');
        else if (state.gridType === 'phim-moi-cap-nhat') elements.navPhimMoi.classList.add('active');
        else if (state.gridType === 'phim-de-cu' && elements.navPhimDeCu) elements.navPhimDeCu.classList.add('active');
        else if (state.gridType === 'top-imdb' && elements.navTopIMDb) elements.navTopIMDb.classList.add('active');
        targetPage = elements.gridViewPage;
    } else if (viewName === 'library') {
        elements.navTuPhim.classList.add('active');
        targetPage = elements.libraryPage;
        
        // Render current active library tab
        const activeTab = document.querySelector('.lib-tab-btn.active').getAttribute('data-tab');
        if (activeTab === 'watchlist') {
            libraryManager.renderWatchlist();
        } else {
            libraryManager.renderHistory();
        }
    }
    
    syncBottomNavigation();
    syncNavIndicator();
    closeMobileMenu();
    
    // Page Transitions using GSAP
    if (ENABLE_GSAP && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Fade out other pages
        pages.forEach(p => {
            if (p !== targetPage && !p.classList.contains('hidden')) {
                gsap.to(p, {
                    opacity: 0,
                    y: -15,
                    duration: 0.2,
                    onComplete: () => {
                        p.classList.add('hidden');
                    }
                });
            }
        });
        
        if (viewName !== 'home' && hero && !hero.classList.contains('hidden')) {
            gsap.to(hero, {
                opacity: 0,
                y: -30,
                duration: 0.2,
                onComplete: () => {
                    hero.classList.add('hidden');
                }
            });
        }
        
        // Prepare target page for transition
        targetPage.classList.remove('hidden');
        gsap.fromTo(targetPage, 
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.35, delay: 0.15, ease: "power2.out" }
        );
        
        if (viewName === 'home') {
            hero.classList.remove('hidden');
            gsap.fromTo(hero,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: "power2.out" }
            );
        }
    } else {
        // Fallback if GSAP is not loaded or reduced motion is active
        pages.forEach(p => p.classList.add('hidden'));
        hero.classList.add('hidden');
        targetPage.classList.remove('hidden');
        if (viewName === 'home') {
            hero.classList.remove('hidden');
        }
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const NAV_INDICATOR_BASE_WIDTH = 100;
const NAV_INDICATOR_SETTLE_MS = 430;

function waitForNextPaint() {
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}

function waitForNavIndicatorSettle(startedAt) {
    const remaining = NAV_INDICATOR_SETTLE_MS - (performance.now() - startedAt);
    if (remaining <= 0) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, remaining));
}

// Keep the selected navigation item visually connected while the SPA swaps content.
// Its size changes through scaleX, keeping the animation on the compositor thread.
function syncNavIndicator({ immediate = false } = {}) {
    const nav = elements.navLinks || document.getElementById('navLinks');
    if (!nav) return;

    let indicator = nav.querySelector('.nav-active-indicator');
    if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'nav-active-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        nav.prepend(indicator);
    }

    const activeLink = nav.querySelector('.nav-link.active');
    if (!activeLink) {
        nav.classList.remove('has-active-indicator');
        return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const x = linkRect.left - navRect.left;
    const y = linkRect.top - navRect.top;

    if (immediate) indicator.style.transition = 'none';
    indicator.style.height = `${linkRect.height}px`;
    indicator.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${linkRect.width / NAV_INDICATOR_BASE_WIDTH})`;
    nav.classList.add('has-active-indicator');

    if (immediate) {
        // Force the initial position to paint before restoring the transition.
        void indicator.offsetWidth;
        indicator.style.removeProperty('transition');
    }
}

function setNavigationHighlight(linkEl, { immediate = false } = {}) {
    document.querySelectorAll('.nav-link.active').forEach(link => link.classList.remove('active'));
    if (linkEl) linkEl.classList.add('active');
    syncBottomNavigation();
    syncNavIndicator({ immediate });
}

function previewNavigationHighlight(targetUrl) {
    const pageName = targetUrl.pathname.split('/').pop().replace(/\.html$/, '').replace(/\.min$/, '');
    let targetLink = null;

    if (pageName === '' || pageName === 'index') {
        targetLink = elements.navTrangChu;
    } else if (pageName === 'tu-phim') {
        targetLink = elements.navTuPhim;
    } else if (pageName === 'danh-sach') {
        const type = targetUrl.searchParams.get('type');
        const linksByType = {
            'phim-moi-cap-nhat': elements.navPhimMoi,
            'phim-le': elements.navPhimLe,
            'phim-bo': elements.navPhimBo,
            'phim-chieu-rap': elements.navPhimChieuRap,
            'the-loai': elements.navTheLoai,
            'quoc-gia': elements.navQuocGia
        };
        targetLink = linksByType[type] || null;
    }

    const activeLink = document.querySelector('.nav-link.active');
    const indicatorWillMove = Boolean(targetLink && targetLink !== activeLink);
    setNavigationHighlight(targetLink);
    return indicatorWillMove;
}

function syncBottomNavigation() {
    if (!elements.bottomNavItems) return;
    const activeLink = document.querySelector('.nav-link.active');
    elements.bottomNavItems.forEach(item => {
        const isActive = activeLink && item.dataset.targetNav === activeLink.id;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
}

function closeMobileMenu() {
    if (!elements.navLinks) return;
    elements.navLinks.classList.remove('active');
    elements.navLinks.querySelectorAll('.mobile-submenu-open').forEach(wrapper => {
        wrapper.classList.remove('mobile-submenu-open');
    });
    elements.navLinks.querySelectorAll('[aria-expanded="true"]').forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
    });
    if (elements.menuIconOpen && elements.menuIconClose) {
        elements.menuIconOpen.classList.remove('hidden');
        elements.menuIconClose.classList.add('hidden');
    }
}

// =========================================================================
// LOADERS & RENDERS
// =========================================================================

/**
 * Fetch and Render Homepage (RoPhim Row Layout)
 */
async function loadHomePage() {
    const homeRows = [
        { endpoint: OP_HOME, params: { limit: 12 }, container: elements.rowPhimMoi },
        { endpoint: OP_PHIM_LE, params: { limit: 12 }, container: elements.rowPhimLe },
        { endpoint: OP_PHIM_BO, params: { limit: 12 }, container: elements.rowPhimBo },
        { endpoint: OP_PHIM_CHIEU_RAP, params: { limit: 12 }, container: elements.rowPhimChieuRap }
    ].filter(row => row.container);

    homeRows.forEach(row => {
        const cached = getCachedApiData(row.endpoint, row.params, { allowStale: true });
        if (cached) {
            renderRow(cached, row.container);
            row.container.dataset.homeRowLoaded = '1';
        } else {
            row.container.innerHTML = createCardSkeletons(8, true);
        }
    });

    const featuredRow = homeRows[0];
    if (!featuredRow) return;
    featuredRow.container.dataset.homeRowLoadStarted = '1';
    const resMoi = await fetchAPI(featuredRow.endpoint, featuredRow.params);

    // Setup Featured Movie Hero & Switcher Carousel
    if (resMoi && resMoi.data && resMoi.data.items && resMoi.data.items.length > 0) {
        const featuredMovies = resMoi.data.items.slice(0, 5);
        setupHeroSwitcher(featuredMovies);
    }

    renderRow(resMoi, elements.rowPhimMoi);
    featuredRow.container.dataset.homeRowLoaded = '1';

    const deferredRows = homeRows.slice(1).filter(row => row.container.dataset.homeRowLoaded !== '1');
    if (!deferredRows.length) return;

    const loadDeferredRow = async row => {
        if (row.container.dataset.homeRowLoadStarted === '1') return;
        row.container.dataset.homeRowLoadStarted = '1';
        const response = await fetchAPI(row.endpoint, row.params);
        renderRow(response, row.container);
        row.container.dataset.homeRowLoaded = '1';
    };

    if (!('IntersectionObserver' in window)) {
        deferredRows.forEach(loadDeferredRow);
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const row = deferredRows.find(item => item.container.closest('.home-row-section') === entry.target);
            if (row) loadDeferredRow(row);
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '500px 0px' });

    deferredRows.forEach(row => {
        const section = row.container.closest('.home-row-section');
        if (section) observer.observe(section);
        else loadDeferredRow(row);
    });
}

function renderRow(response, container) {
    container.innerHTML = '';
    if (response && response.data && response.data.items && response.data.items.length > 0) {
        response.data.items.forEach(movie => {
            const card = createMovieCardHTML(movie);
            container.appendChild(card);
        });

        // Rendered instantly with no scroll load delay
    } else {
        container.innerHTML = `
            <div class="row-placeholder text-error">
                <i data-lucide="cloud-off"></i>
                <span>Không thể tải dữ liệu phim. Vui lòng thử lại sau.</span>
            </div>
        `;
    }
    lucide.createIcons();
}

/**
 * Create Movie Card Node
 */
function createMovieCardHTML(movie) {
    const imgSource = (movie.poster_url && movie.poster_url !== '') ? movie.poster_url : movie.thumb_url;
    const finalImgUrl = getImageUrl(imgSource, 'assets/logo.png', { width: 360, quality: 72 });
    const year = movie.year || 'N/A';
    const quality = movie.quality || 'HD';
    const lang = movie.lang || 'Vietsub';
    const movieName = escapeHTML(movie.name || 'Đang cập nhật');
    const movieTime = escapeHTML(movie.time || '? phút');
    const episodeCurrent = movie.episode_current ? escapeHTML(movie.episode_current) : '';

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Xem chi tiết ${movie.name || 'phim'}`);
    card.innerHTML = `
        <div class="movie-poster-container">
            <span class="movie-quality">${escapeHTML(quality)}</span>
            <span class="movie-lang">${escapeHTML(lang)}</span>
            <img src="${finalImgUrl}" alt="${movieName}" class="movie-poster" loading="lazy" decoding="async" fetchpriority="low" onerror="this.src='assets/logo.png';">
            
            <div class="movie-overlay">
                <button class="play-btn-circle" type="button" aria-label="Mở chi tiết phim">
                    <i data-lucide="play"></i>
                </button>
                ${episodeCurrent ? `<span class="movie-episode-badge">${episodeCurrent}</span>` : ''}
            </div>
        </div>
        <div class="movie-info">
            <h3 class="movie-name" title="${movieName}">${movieName}</h3>
            <div class="movie-meta">
                <span>${escapeHTML(year)}</span>
                <span>${movieTime}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        warmMovieIntent(movie, { immediate: true, includeTmdbImages: true, withPosterImages: true });
        navigateToPage(`phim.html?slug=${movie.slug}`);
    });
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            warmMovieIntent(movie, { immediate: true, includeTmdbImages: true, withPosterImages: true });
            navigateToPage(`phim.html?slug=${movie.slug}`);
        }
    });
    if (shouldUsePassiveIntentPrefetch()) {
        const warmCard = () => warmMovieIntent(movie, { priority: 10, withPosterImages: true });
        card.addEventListener('pointerenter', warmCard, { passive: true });
        card.addEventListener('touchstart', warmCard, { passive: true });
        card.addEventListener('focusin', warmCard);
    }
    return card;
}

/**
 * Smoothly change Hero Background using double layers cross-fade
 */
function changeHeroBackground(newImageUrl) {
    const hero = elements.heroSection;
    if (!hero) return;
    
    let bgCurrent = hero.querySelector('.hero-bg-current');
    let bgNext = hero.querySelector('.hero-bg-next');
    
    // Create dynamically if not present in DOM
    if (!bgCurrent) {
        bgCurrent = document.createElement('div');
        bgCurrent.className = 'hero-bg-current';
        bgNext = document.createElement('div');
        bgNext.className = 'hero-bg-next';
        
        const styleBg = (el) => {
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
            el.style.backgroundRepeat = 'no-repeat';
        };
        styleBg(bgCurrent);
        styleBg(bgNext);
        
        bgCurrent.style.zIndex = '1';
        bgCurrent.style.opacity = '1';
        bgNext.style.zIndex = '2';
        bgNext.style.opacity = '0';
        
        const currentBg = hero.style.backgroundImage;
        bgCurrent.style.backgroundImage = currentBg;
        
        // Remove background image from heroSection itself so it doesn't conflict
        hero.style.backgroundImage = 'none';
        
        hero.insertBefore(bgNext, hero.firstChild);
        hero.insertBefore(bgCurrent, hero.firstChild);
        
        // Ensure overlay and content z-index are stacked correctly
        const overlay = hero.querySelector('.hero-overlay');
        if (overlay) overlay.style.zIndex = '3';
        const grid = hero.querySelector('.hero-grid-container');
        if (grid) {
            grid.style.position = 'relative';
            grid.style.zIndex = '4';
        }
    }
    
    const newBgStyle = `url("${newImageUrl}")`;
    if (bgCurrent.style.backgroundImage === newBgStyle) return;
    
    // Set next background image
    bgNext.style.backgroundImage = newBgStyle;
    
    // Use the browser's native compositor instead of shipping a full animation library.
    if (bgNext.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bgNext.getAnimations().forEach(animation => animation.cancel());
        bgCurrent.getAnimations().forEach(animation => animation.cancel());

        const reveal = bgNext.animate([
            { opacity: 0, transform: 'scale(1.03)' },
            { opacity: 1, transform: 'scale(1)' }
        ], {
            duration: 800,
            easing: 'cubic-bezier(.22,.61,.36,1)'
        });

        bgCurrent.animate([
            { opacity: 1 },
            { opacity: 0.2 }
        ], {
            duration: 650,
            easing: 'ease-out'
        });

        reveal.onfinish = () => {
            bgCurrent.style.backgroundImage = newBgStyle;
            bgCurrent.style.opacity = '1';
            bgNext.style.opacity = '0';
        };
    } else {
        bgCurrent.style.backgroundImage = newBgStyle;
        bgNext.style.opacity = '0';
    }
}

/**
 * Populate Hero Section
 */
function setupHeroSection(movie) {
    // Background image set to poster/backdrop if exists
    const posterUrl = getImageUrl(movie.poster_url, 'assets/logo.png', { width: 1280, quality: 76 });
    const thumbUrl = getImageUrl(movie.thumb_url, 'assets/logo.png', { width: 1280, quality: 76 });
    const backdrop = movie.thumb_url ? thumbUrl : posterUrl;
    
    changeHeroBackground(backdrop);

    if (PREFETCH_CONFIG.tmdbHeroBackdropEnabled) {
        fetchAPI(OP_IMAGES, { slug: movie.slug }).then(imageData => {
            if (imageData && imageData.data && imageData.data.images) {
                const backdrops = imageData.data.images.filter(img => img.type === 'backdrop');
                if (backdrops.length > 0) {
                    const tmdbBackdrop = backdrops[0].file_path;
                    changeHeroBackground(tmdbBackdrop);
                }
            }
        }).catch(err => console.error('Error fetching Hero TMDB image:', err));
    }

    const heroTitle = elements.heroTitle;
    const heroDesc = elements.heroDesc;
    const heroMeta = document.getElementById('heroMeta');

    // Update play, info, and fav button handlers immediately without layout change
    elements.heroBtnPlay.onclick = (e) => {
        e.stopPropagation();
        warmMovieIntent(movie, { immediate: true });
        navigateToPage(`xem-phim.html?slug=${movie.slug}&ep=0`);
    };
    if (shouldUsePassiveIntentPrefetch()) {
        elements.heroBtnPlay.onmouseenter = () => {
            warmMovieIntent(movie, { priority: 10, includeTmdbImages: true, withPosterImages: true });
        };
    }
    elements.heroBtnInfo.onclick = (e) => {
        e.stopPropagation();
        warmMovieIntent(movie, { immediate: true, includeTmdbImages: true, withPosterImages: true });
        navigateToPage(`phim.html?slug=${movie.slug}`);
    };
    if (shouldUsePassiveIntentPrefetch()) {
        elements.heroBtnInfo.onmouseenter = () => {
            warmMovieIntent(movie, { priority: 10, includeTmdbImages: true, withPosterImages: true });
        };
    }

    // Setup Favorite/Watchlist heart button on Hero
    if (elements.heroBtnFav) {
        const inWatchlist = libraryManager.isInWatchlist(movie.slug);
        elements.heroBtnFav.classList.toggle('active', inWatchlist);
        const currentIcon = elements.heroBtnFav.querySelector('[data-lucide]') || elements.heroBtnFav.querySelector('i');
        if (currentIcon) currentIcon.setAttribute('data-lucide', inWatchlist ? 'heart-off' : 'heart');
        lucide.createIcons();

        elements.heroBtnFav.onclick = (e) => {
            e.stopPropagation();
            const nowInWatchlist = libraryManager.isInWatchlist(movie.slug);
            if (nowInWatchlist) {
                libraryManager.removeFromWatchlist(movie.slug);
                elements.heroBtnFav.classList.remove('active');
                const currentIcon = elements.heroBtnFav.querySelector('[data-lucide]') || elements.heroBtnFav.querySelector('i');
                if (currentIcon) currentIcon.setAttribute('data-lucide', 'heart');
                showToast('Đã xóa khỏi tủ phim.', 'remove');
            } else {
                libraryManager.addToWatchlist(movie);
                elements.heroBtnFav.classList.add('active');
                const currentIcon = elements.heroBtnFav.querySelector('[data-lucide]') || elements.heroBtnFav.querySelector('i');
                if (currentIcon) currentIcon.setAttribute('data-lucide', 'heart-off');
                showToast('Đã thêm vào tủ phim.', 'success');
            }
            lucide.createIcons();
        };
    }

    // Update text content instantly to prevent annoying flashing
    heroTitle.textContent = movie.name;
    heroDesc.textContent = movie.origin_name || 'Khám phá thế giới phim hay chất lượng cao vietsub thuyết minh mới nhất.';
    if (heroMeta) {
        heroMeta.innerHTML = `
            <span><i data-lucide="calendar"></i>${escapeHTML(movie.year || 'Mới cập nhật')}</span>
            <span><i data-lucide="badge-check"></i>${escapeHTML(movie.quality || 'HD')} / ${escapeHTML(movie.lang || 'Vietsub')}</span>
            <span><i data-lucide="timer"></i>${escapeHTML(movie.time || movie.episode_current || 'Đang cập nhật')}</span>
        `;
        lucide.createIcons();
    }
}

// =========================================================================
// GRID VIEW & FILTER LOGIC
// =========================================================================

/**
 * Fetch categories and countries for filters dropdown
 */
async function loadFiltersData() {
    if (elements.filterGenre.options.length > 1) return;

    elements.filterGenre.innerHTML = '<option value="">Tất cả thể loại</option>';
    elements.filterCountry.innerHTML = '<option value="">Tất cả quốc gia</option>';
    elements.filterYear.innerHTML = '<option value="">Tất cả năm</option>';

    Object.entries(GENRE_MAP).forEach(([slug, name]) => {
        const opt = document.createElement('option');
        opt.value = slug;
        opt.textContent = name;
        elements.filterGenre.appendChild(opt);
    });

    Object.entries(COUNTRY_MAP).forEach(([slug, name]) => {
        const opt = document.createElement('option');
        opt.value = slug;
        opt.textContent = name;
        elements.filterCountry.appendChild(opt);
    });

    const currentYear = new Date().getFullYear();
    for (let yr = currentYear; yr >= 2010; yr--) {
        const opt = document.createElement('option');
        opt.value = yr;
        opt.textContent = yr;
        elements.filterYear.appendChild(opt);
    }
}

/**
 * Load Movie Grid with pagination
 */
async function loadGrid(type, keyword = '', page = 1) {
    state.gridType = type;
    state.gridKeyword = keyword;
    state.gridPage = page;

    elements.gridNoResults.classList.add('hidden');
    elements.gridPagination.classList.add('hidden');

    let endpoint = '';
    let params = { page: page, limit: 24 };

    // Determine query endpoint and params
    if (type === 'phim-bo') {
        elements.gridPageTitle.textContent = 'Phim Bộ';
        endpoint = OP_PHIM_BO;
    } else if (type === 'phim-le') {
        elements.gridPageTitle.textContent = 'Phim Lẻ';
        endpoint = OP_PHIM_LE;
    } else if (type === 'phim-chieu-rap') {
        elements.gridPageTitle.textContent = 'Phim Chiếu Rạp';
        endpoint = OP_PHIM_CHIEU_RAP;
    } else if (type === 'phim-moi-cap-nhat') {
        elements.gridPageTitle.textContent = 'Phim Mới Cập Nhật';
        endpoint = OP_HOME;
    } else if (type === 'the-loai') {
        const displayName = GENRE_MAP[keyword] || keyword.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        elements.gridPageTitle.textContent = `Thể loại: ${displayName}`;
        endpoint = OP_GENRE;
        params.slug = keyword;
    } else if (type === 'quoc-gia') {
        const displayName = COUNTRY_MAP[keyword] || keyword.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        elements.gridPageTitle.textContent = `Quốc gia: ${displayName}`;
        endpoint = OP_COUNTRY;
        params.slug = keyword;
    } else if (type === 'search') {
        elements.gridPageTitle.textContent = `Kết Quả Tìm Kiếm: "${keyword}"`;
        endpoint = OP_SEARCH;
        params.keyword = keyword;
    } else if (type === 'filter') {
        elements.gridPageTitle.textContent = 'Bộ Lọc Phim';
        
        // Check if filtering by specific category/country slugs
        if (state.filters.genre) {
            endpoint = OP_GENRE;
            params.slug = state.filters.genre;
        } else if (state.filters.country) {
            endpoint = OP_COUNTRY;
            params.slug = state.filters.country;
        } else {
            endpoint = OP_HOME;
        }
        
        // Append additional filter fields as query parameters
        params.sort_field = state.filters.sort;
        if (state.filters.genre) params.category = state.filters.genre;
        if (state.filters.country) params.country = state.filters.country;
        if (state.filters.year) params.year = state.filters.year;
    }

    renderActiveFilterChips();

    const cachedData = endpoint ? getCachedApiData(endpoint, params, { allowStale: true }) : null;
    if (cachedData && cachedData.data) {
        elements.gridLoader.classList.add('hidden');
        renderGridResponse(cachedData, type, page, endpoint, params);
        return;
    }

    elements.movieGrid.innerHTML = createCardSkeletons(12);
    elements.gridLoader.classList.remove('hidden');

    const data = await fetchAPI(endpoint, params);
    elements.gridLoader.classList.add('hidden');

    renderGridResponse(data, type, page, endpoint, params);
}

function renderGridResponse(data, type, page, endpoint, params) {
    if (data && data.data) {
        // Update title with exact name from API if available
        if (type === 'the-loai' && data.data.titlePage) {
            elements.gridPageTitle.textContent = `Thể loại: ${data.data.titlePage}`;
        } else if (type === 'quoc-gia' && data.data.titlePage) {
            elements.gridPageTitle.textContent = `Quốc gia: ${data.data.titlePage}`;
        }

        if (data.data.items && data.data.items.length > 0) {
            elements.movieGrid.innerHTML = '';
            data.data.items.forEach(movie => {
                const card = createMovieCardHTML(movie);
                elements.movieGrid.appendChild(card);
            });

            // Display cards instantly with no slide-up/blink reveal transition

            // Setup Pagination
            const pagin = data.data.params?.pagination;
            state.gridTotalPages = 1;
            if (pagin) {
                const totalItems = pagin.totalItems;
                const itemsPerPage = pagin.totalItemsPerPage;
                state.gridTotalPages = itemsPerPage ? Math.ceil(totalItems / itemsPerPage) : 1;
                
                if (state.gridTotalPages > 1) {
                    elements.gridPagination.classList.remove('hidden');
                    elements.gridPageInfo.textContent = `Trang ${page} / ${state.gridTotalPages}`;
                    elements.gridPrevPage.disabled = page === 1;
                    elements.gridNextPage.disabled = page === state.gridTotalPages;
                }
            }

            scheduleGridPagePrefetch(endpoint, params, page, state.gridTotalPages);
        } else {
            elements.movieGrid.innerHTML = '';
            elements.gridNoResults.classList.remove('hidden');
        }
    } else {
        elements.movieGrid.innerHTML = '';
        elements.gridNoResults.classList.remove('hidden');
    }

    lucide.createIcons();
}

function scheduleGridPagePrefetch(endpoint, params, page, totalPages) {
    if (!PREFETCH_CONFIG.nextGridPagePrefetchEnabled || !endpoint || shouldUseConservativeNetworkMode()) return;

    for (let nextP = page + 1; nextP <= Math.min(page + PREFETCH_CONFIG.gridPagesAhead, totalPages); nextP++) {
        queueApiPrefetch(endpoint, { ...params, page: nextP }, { priority: 8 });
    }
}

function queueListPagePrefetch(type, keyword = '', page = 1, priority = 8) {
    let endpoint = '';
    const params = { page, limit: 24 };

    if (type === 'phim-bo') endpoint = OP_PHIM_BO;
    else if (type === 'phim-le') endpoint = OP_PHIM_LE;
    else if (type === 'phim-chieu-rap') endpoint = OP_PHIM_CHIEU_RAP;
    else if (type === 'phim-moi-cap-nhat') endpoint = OP_HOME;
    else if (type === 'the-loai' && keyword) {
        endpoint = OP_GENRE;
        params.slug = keyword;
    } else if (type === 'quoc-gia' && keyword) {
        endpoint = OP_COUNTRY;
        params.slug = keyword;
    }

    if (endpoint) {
        prefetchPageHTML('danh-sach.html');
        queueApiPrefetch(endpoint, params, { priority });
    }
}

function renderActiveFilterChips() {
    if (!elements.activeFilterChips) return;

    const chips = [];
    const genreText = elements.filterGenre?.selectedOptions?.[0]?.textContent;
    const countryText = elements.filterCountry?.selectedOptions?.[0]?.textContent;
    
    if (state.filters.genre && genreText) chips.push(genreText);
    if (state.filters.country && countryText) chips.push(countryText);
    if (state.filters.year) chips.push(`Năm ${state.filters.year}`);

    if (chips.length > 0) {
        elements.activeFilterChips.classList.remove('hidden');
        elements.activeFilterChips.innerHTML = chips.map(label => `
            <span class="active-filter-chip">
                <i data-lucide="sparkle"></i>
                ${escapeHTML(label)}
            </span>
        `).join('');
    } else {
        elements.activeFilterChips.classList.add('hidden');
        elements.activeFilterChips.innerHTML = '';
    }
}

// =========================================================================
// MOVIE DETAIL MODAL
// =========================================================================
function selectTmdbImages(imageData) {
    const images = imageData?.data?.images || [];
    const backdrops = images.filter(img => img.type === 'backdrop');
    const posters = images.filter(img => img.type === 'poster');

    return {
        backdrop: backdrops.length > 0 ? backdrops[0].file_path : null,
        poster: posters.length > 0 ? posters[0].file_path : null
    };
}

async function fetchMovieDetails(slug) {
    lastFocusedElement = document.activeElement;
    elements.movieModal.classList.add('active');
    elements.movieModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Stop background scroll

    elements.modalBody.innerHTML = '';
    elements.closeModalBtn.focus();

    const cachedData = getCachedApiData(OP_DETAILS, { slug }, { allowStale: true });
    if (cachedData && cachedData.data && cachedData.data.item) {
        const cachedImages = selectTmdbImages(getCachedApiData(OP_IMAGES, { slug }, { allowStale: true }));
        elements.modalLoading.classList.add('hidden');
        renderMovieDetails(cachedData.data.item, cachedImages.backdrop, cachedImages.poster);
        return;
    }

    elements.modalLoading.classList.remove('hidden');

    // Parallel fetch for details and images
    const [data, imageData] = await Promise.all([
        fetchAPI(OP_DETAILS, { slug }),
        fetchAPI(OP_IMAGES, { slug })
    ]);
    
    elements.modalLoading.classList.add('hidden');

    if (data && data.data && data.data.item) {
        let tmdbBackdrop = null;
        let tmdbPoster = null;
        if (imageData && imageData.data && imageData.data.images) {
            const backdrops = imageData.data.images.filter(img => img.type === 'backdrop');
            const posters = imageData.data.images.filter(img => img.type === 'poster');
            if (backdrops.length > 0) {
                tmdbBackdrop = backdrops[0].file_path;
            }
            if (posters.length > 0) {
                tmdbPoster = posters[0].file_path;
            }
        }
        renderMovieDetails(data.data.item, tmdbBackdrop, tmdbPoster);
    } else {
        elements.modalBody.innerHTML = `
            <div class="no-results" style="border:none;">
                <p>Không thể tải thông tin bộ phim này. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

function renderMovieDetails(movie, tmdbBackdrop = null, tmdbPoster = null) {
    const posterUrl = getImageUrl(tmdbPoster || movie.poster_url, 'assets/logo.png', { width: 480, quality: 76 });
    const thumbUrl = getImageUrl(tmdbBackdrop || movie.thumb_url || movie.poster_url, 'assets/logo.png', { width: 1280, quality: 76 });
    const backdropImg = getImageUrl(tmdbBackdrop || movie.thumb_url || movie.poster_url, posterUrl, { width: 1280, quality: 76 });

    const genres = movie.category ? movie.category.map(c => c.name).join(', ') : 'N/A';
    const countries = movie.country ? movie.country.map(c => c.name).join(', ') : 'N/A';
    const actors = movie.actor && movie.actor[0] !== "" ? movie.actor.join(', ') : 'Đang cập nhật';
    const directors = movie.director && movie.director[0] !== "" ? movie.director.join(', ') : 'Đang cập nhật';
    const description = movie.content || 'Nội dung đang được cập nhật.';
    const formattedDate = movie.modified?.time ? new Date(movie.modified.time).toLocaleDateString('vi-VN') : 'Đang cập nhật';

    // Check watchlist status
    const inWatchlist = libraryManager.isInWatchlist(movie.slug);
    const watchBtnClass = inWatchlist ? 'watchlist-toggle-btn in-watchlist' : 'watchlist-toggle-btn';
    const watchBtnText = inWatchlist ? 'Đã lưu yêu thích' : 'Thêm vào yêu thích';
    const watchBtnIcon = inWatchlist ? 'check-circle-2' : 'heart';

    const html = `
        <div class="modal-backdrop" style="background-image: url('${backdropImg}')"></div>
        <div class="modal-scroll-content">
            <div class="modal-header-info">
                <img src="${posterUrl}" alt="${escapeHTML(movie.name)}" class="modal-poster" decoding="async" onerror="this.src='assets/logo.png';">
                
                <div class="modal-meta-header">
                    <div class="modal-title-wrapper">
                        <div>
                            <h2 class="modal-title">${escapeHTML(movie.name)}</h2>
                            <p class="modal-origin-title">${escapeHTML(movie.origin_name || '')} (${escapeHTML(movie.year || 'N/A')})</p>
                        </div>
                    </div>
                    
                    <div class="modal-tags">
                        <span class="tag">${escapeHTML(movie.quality || 'HD')}</span>
                        <span class="tag">${escapeHTML(movie.lang || 'Vietsub')}</span>
                        <span class="tag">${escapeHTML(movie.time || '? phút')}</span>
                        <span class="tag">${escapeHTML(movie.episode_current || 'Tập 1')}</span>
                    </div>
                    
                    <div class="modal-stats">
                        <div class="stat-item">
                            <i data-lucide="calendar"></i>
                            <span>Năm: ${escapeHTML(movie.year || 'N/A')}</span>
                        </div>
                        <div class="stat-item">
                            <i data-lucide="globe"></i>
                            <span>Quốc gia: ${escapeHTML(countries)}</span>
                        </div>
                    </div>

                    <div class="modal-actions-group">
                        <button class="btn btn-primary" id="modalWatchBtn">
                            <i data-lucide="play"></i> XEM PHIM
                        </button>
                        <button class="${watchBtnClass} btn" id="watchlistToggleBtn">
                            <i data-lucide="${watchBtnIcon}"></i>
                            <span>${watchBtnText}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="modal-content-details">
                <div class="modal-synopsis">
                    <h3>Tóm Tắt Nội Dung</h3>
                    <p>${description}</p>
                </div>
                
                <div class="modal-info-list">
                    <div class="info-row">
                        <span class="info-label">Thể loại</span>
                        <span class="info-value">${escapeHTML(genres)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Đạo diễn</span>
                        <span class="info-value">${escapeHTML(directors)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Diễn viên</span>
                        <span class="info-value">${escapeHTML(actors)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cập nhật cuối</span>
                        <span class="info-value">${escapeHTML(formattedDate)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    elements.modalBody.innerHTML = html;

    // Watchlist Favorite Button Action
    const watchlistToggleBtn = document.getElementById('watchlistToggleBtn');
    setWatchlistButtonState(watchlistToggleBtn, inWatchlist, movie.slug);
    watchlistToggleBtn.addEventListener('click', () => {
        const isFav = libraryManager.isInWatchlist(movie.slug);
        if (isFav) {
            libraryManager.removeFromWatchlist(movie.slug);
            setWatchlistButtonState(watchlistToggleBtn, false, movie.slug);
            showToast('Đã xóa khỏi tủ phim.', 'remove');
        } else {
            libraryManager.addToWatchlist(movie);
            setWatchlistButtonState(watchlistToggleBtn, true, movie.slug);
            showToast('Đã thêm vào tủ phim.', 'success');
        }
        lucide.createIcons();
    });

    // Play Button Action
    const modalWatchBtn = document.getElementById('modalWatchBtn');
    modalWatchBtn.addEventListener('click', () => {
        closeModal();
        playMovie(movie, 0, 0);
    });

    // GSAP Details Modal Entrance
    if (ENABLE_GSAP && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const dialog = elements.movieModal.querySelector('.modal-dialog');
        const poster = elements.movieModal.querySelector('.modal-poster');
        const headerInfo = elements.movieModal.querySelector('.modal-meta-header');
        const details = elements.movieModal.querySelector('.modal-content-details');
        
        gsap.fromTo(dialog, 
            { scale: 0.95, y: 20 },
            { scale: 1, y: 0, duration: 0.4, ease: "power3.out" }
        );
        if (poster) {
            gsap.fromTo(poster, 
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, delay: 0.1, ease: "power2.out" }
            );
        }
        if (headerInfo) {
            gsap.fromTo(headerInfo.children, 
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, delay: 0.15, ease: "power2.out" }
            );
        }
        if (details) {
            gsap.fromTo(details.children, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.25, ease: "power2.out" }
            );
        }
    }

    lucide.createIcons();
}

function closeModal() {
    if (ENABLE_GSAP && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const dialog = elements.movieModal.querySelector('.modal-dialog');
        gsap.killTweensOf(dialog);
        gsap.to(dialog, {
            scale: 0.95,
            y: 15,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                elements.movieModal.classList.remove('active');
                elements.movieModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                if (lastFocusedElement && document.contains(lastFocusedElement)) {
                    lastFocusedElement.focus();
                }
            }
        });
        gsap.to(elements.movieModal, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.in"
        });
    } else {
        elements.movieModal.classList.remove('active');
        elements.movieModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusedElement && document.contains(lastFocusedElement)) {
            lastFocusedElement.focus();
        }
    }
}

// =========================================================================
// SMART VIDEO PLAYER MODAL
// =========================================================================

/**
 * Open video player modal from slug and automatically resolve links
 */
async function playMovieFromSlug(slug, episodeIndex = 0, serverIndex = 0) {
    if (!elements.playerModal) {
        navigateToPage(`xem-phim.html?slug=${slug}&ep=${episodeIndex}&sv=${serverIndex}`);
        return;
    }
    lastFocusedElement = document.activeElement;
    elements.playerModal.classList.add('active');
    elements.playerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    elements.playerBody.innerHTML = '<div class="loader" style="margin: 4rem auto;"></div>';
    elements.closePlayerBtn.focus();

    const data = await fetchAPI(OP_DETAILS, { slug });

    if (data && data.data && data.data.item) {
        playMovie(data.data.item, episodeIndex, serverIndex);
    } else {
        closePlayerModal();
        showToast('Rất tiếc! Không thể kết nối tới server phát phim.', 'error');
    }
}

/**
 * Handle player UI logic and episode switching through the server-side player
 */
async function playMovie(movie, episodeIndex = 0, serverIndex = 0) {
    if (!elements.playerModal.classList.contains('active')) {
        lastFocusedElement = document.activeElement;
    }
    elements.playerModal.classList.add('active');
    elements.playerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    elements.playerBody.innerHTML = '<div class="loader" style="margin: 4rem auto;"></div>';

    const playback = getMoviePlaybackState(movie, episodeIndex, serverIndex);
    let { episodes, serverData, currentEpisode } = playback;

    const playerUrl = !playback.isUnavailable ? createPlayerUrl(movie.slug, episodeIndex, serverIndex) : null;

    const movieName = movie.name;
    const epName = playerUrl && currentEpisode?.name ? currentEpisode.name : (playerUrl ? `Tập ${episodeIndex + 1}` : PLAYER_UPDATE_MESSAGE);
    
    // Save to Watch History
    if (playerUrl) libraryManager.addToHistory(movie, epName, episodeIndex, serverIndex);

    let html = `
        <div class="player-movie-info">
            <span class="player-kicker">Đang phát</span>
            <h2 class="player-movie-title">${escapeHTML(movieName)}</h2>
            <p class="player-episode-info"><span>${escapeHTML(epName)}</span></p>
        </div>


        <div class="video-container">
            ${playerUrl ? createPlayerFrameHTML(playerUrl) : renderPlayerUnavailableBlock({
                actionHtml: '<button class="btn btn-sm btn-primary" style="margin-top:15px;" onclick="closePlayerModal()">Đóng</button>'
            })}
        </div>
    `;

    if (episodes.length > 1) {
        html += `
            <div class="server-section">
                <h3 class="episode-title">Nguồn phát:</h3>
                <div class="server-tabs">
                    ${episodes.map((server, idx) => `
                        <button class="server-tab ${idx === serverIndex ? 'active' : ''}" onclick="changeEpisode('${movie.slug}', ${episodeIndex}, ${idx})">
                            ${escapeHTML(server.server_name || `Server ${idx + 1}`)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Render Episode Selector List (if multiple episodes exist)
    if (serverData.length > 1) {
        html += `
            <div class="episode-section">
                <h3 class="episode-title">Chọn Tập Phim:</h3>
                ${generateEpisodesHTML(movie.slug, serverData, episodeIndex, serverIndex, 'button')}
            </div>
        `;
    }

    elements.playerBody.innerHTML = html;
    bindPlayerFrameLoader(elements.playerBody);
    
    // GSAP Player Entrance
    if (ENABLE_GSAP && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const dialog = elements.playerModal.querySelector('.modal-dialog');
        gsap.fromTo(dialog, 
            { scale: 0.95, y: 20 },
            { scale: 1, y: 0, duration: 0.4, ease: "power3.out" }
        );
    }

    lucide.createIcons();
}

/**
 * Switch episode directly from inside Player
 */
window.changeEpisode = async (slug, epIndex, svIndex = 0) => {
    elements.playerBody.innerHTML = '<div class="loader" style="margin: 4rem auto;"></div>';
    const data = await fetchAPI(OP_DETAILS, { slug });
    if (data && data.data && data.data.item) {
        playMovie(data.data.item, epIndex, svIndex);
    }
};

function closePlayerModal() {
    if (ENABLE_GSAP && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const dialog = elements.playerModal.querySelector('.modal-dialog');
        gsap.to(dialog, {
            scale: 0.95,
            y: 15,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                elements.playerModal.classList.remove('active');
                elements.playerModal.setAttribute('aria-hidden', 'true');
                elements.playerBody.innerHTML = '';
                document.body.style.overflow = '';
                if (lastFocusedElement && document.contains(lastFocusedElement)) {
                    lastFocusedElement.focus();
                }
            }
        });
        gsap.to(elements.playerModal, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.in"
        });
    } else {
        elements.playerModal.classList.remove('active');
        elements.playerModal.setAttribute('aria-hidden', 'true');
        elements.playerBody.innerHTML = '';
        document.body.style.overflow = '';
        if (lastFocusedElement && document.contains(lastFocusedElement)) {
            lastFocusedElement.focus();
        }
    }
}

window.closePlayerModal = closePlayerModal;

// =========================================================================
// EVENT LISTENERS & WINDOW SCROLL EFFECTS
// =========================================================================
function initScrollEffects() {
    if (!elements.navbar) return;

    let lastScrolledState = null;
    let ticking = false;

    const updateNavbarState = () => {
        const isScrolled = window.scrollY > 40;
        if (isScrolled === lastScrolledState) return;

        elements.navbar.classList.toggle('scrolled', isScrolled);
        lastScrolledState = isScrolled;
    };

    updateNavbarState();

    window.addEventListener('scroll', () => {
        if (ticking) return;

        ticking = true;
        requestAnimationFrame(() => {
            updateNavbarState();
            ticking = false;
        });
    }, { passive: true });
}

function initStaticEventListeners() {
    elements.bottomNavItems.forEach(item => {
        const getBottomNavUrl = () => {
            const targetNav = item.dataset.targetNav;
            if (targetNav === 'navTrangChu') {
                return 'index.html';
            } else if (targetNav === 'navPhimBo') {
                return 'danh-sach.html?type=phim-bo';
            } else if (targetNav === 'navPhimLe') {
                return 'danh-sach.html?type=phim-le';
            } else if (targetNav === 'navTuPhim') {
                return 'tu-phim.html';
            }
            return '';
        };
        const warmBottomNav = () => {
            const targetUrl = getBottomNavUrl();
            if (targetUrl) prefetchLinkResources(targetUrl);
        };
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetUrl = getBottomNavUrl();
            warmBottomNav();
            if (targetUrl) navigateToPage(targetUrl);
        });
        if (shouldUsePassiveIntentPrefetch()) {
            item.addEventListener('pointerenter', warmBottomNav, { passive: true });
            item.addEventListener('touchstart', warmBottomNav, { passive: true });
            item.addEventListener('focusin', warmBottomNav);
        }
    });

    elements.mobileMenuBtn.addEventListener('click', () => {
        const isOpen = elements.navLinks.classList.toggle('active');
        elements.mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) {
            elements.menuIconOpen.classList.add('hidden');
            elements.menuIconClose.classList.remove('hidden');
        } else {
            elements.menuIconOpen.classList.remove('hidden');
            elements.menuIconClose.classList.add('hidden');
        }
    });

    [elements.navTheLoai, elements.navQuocGia].forEach(toggle => {
        if (!toggle) return;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.addEventListener('click', event => {
            if (!window.matchMedia('(max-width: 1280px)').matches) return;
            event.preventDefault();
            const wrapper = toggle.closest('.nav-dropdown-wrapper');
            if (!wrapper) return;
            elements.navLinks.querySelectorAll('.mobile-submenu-open').forEach(otherWrapper => {
                if (otherWrapper === wrapper) return;
                otherWrapper.classList.remove('mobile-submenu-open');
                const otherToggle = otherWrapper.querySelector(':scope > .nav-link');
                otherToggle?.setAttribute('aria-expanded', 'false');
            });
            const isOpen = wrapper.classList.toggle('mobile-submenu-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    });

    const executeSearch = () => {
        const keyword = elements.searchInput.value.trim();
        if (keyword.length >= 2) {
            navigateToPage(`danh-sach.html?type=search&keyword=${encodeURIComponent(keyword)}`);
        } else if (keyword.length > 0) {
            showToast('Vui lòng nhập từ khóa tìm kiếm có ít nhất 2 ký tự.', 'error');
        }
    };

    elements.searchBtn.addEventListener('click', executeSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeSearch();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.movieModal && elements.movieModal.classList.contains('active')) closeModal();
            if (elements.playerModal && elements.playerModal.classList.contains('active')) closePlayerModal();
            if (elements.loginModal && elements.loginModal.classList.contains('active')) {
                sessionManager.closeLoginModal();
            }
        }
    });

    document.addEventListener('click', (e) => {
        const link = (e.target && typeof e.target.closest === 'function') ? e.target.closest('a') : null;
        if (link && shouldHandleLink(link)) {
            e.preventDefault();
            navigateToPage(link.getAttribute('href'));
        }
    });

    const hoverHandler = (e) => {
        const link = (e.target && typeof e.target.closest === 'function') ? e.target.closest('a') : null;
        if (link && shouldHandleLink(link)) {
            prefetchLinkResources(link.getAttribute('href'));
        }
    };
    if (shouldUsePassiveIntentPrefetch()) {
        document.addEventListener('mouseenter', hoverHandler, { capture: true, passive: true });
        document.addEventListener('touchstart', hoverHandler, { capture: true, passive: true });
        document.addEventListener('focusin', hoverHandler, { capture: true, passive: true });
    }

    window.addEventListener('popstate', (e) => {
        navigateToPage(window.location.href, false);
    });

    let navIndicatorResizeFrame = null;
    window.addEventListener('resize', () => {
        if (navIndicatorResizeFrame) cancelAnimationFrame(navIndicatorResizeFrame);
        navIndicatorResizeFrame = requestAnimationFrame(() => {
            syncNavIndicator({ immediate: true });
            navIndicatorResizeFrame = null;
        });
    }, { passive: true });
}

function initDynamicPageEventListeners() {
    const viewAllButtons = document.querySelectorAll('.row-view-all');
    viewAllButtons.forEach(btn => {
        const warmViewAll = () => {
            const cat = btn.getAttribute('data-category');
            if (cat) queueListPagePrefetch(cat, '', 1, 9);
        };
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = btn.getAttribute('data-category');
            warmViewAll();
            navigateToPage(`danh-sach.html?type=${cat}`);
        });
        if (shouldUsePassiveIntentPrefetch()) {
            btn.addEventListener('pointerenter', warmViewAll, { passive: true });
            btn.addEventListener('touchstart', warmViewAll, { passive: true });
            btn.addEventListener('focusin', warmViewAll);
        }
    });

    const quickSearchChips = document.querySelectorAll('.quick-search-chip');
    quickSearchChips.forEach(chip => {
        const warmQuickSearch = () => {
            const keyword = chip.dataset.keyword;
            if (keyword) {
                prefetchPageHTML('danh-sach.html');
                queueApiPrefetch(OP_SEARCH, { keyword, page: 1, limit: 24 }, { priority: 7 });
            }
        };
        chip.addEventListener('click', () => {
            warmQuickSearch();
            navigateToPage(`danh-sach.html?type=search&keyword=${encodeURIComponent(chip.dataset.keyword)}`);
        });
        if (shouldUsePassiveIntentPrefetch()) {
            chip.addEventListener('pointerenter', warmQuickSearch, { passive: true });
            chip.addEventListener('touchstart', warmQuickSearch, { passive: true });
            chip.addEventListener('focusin', warmQuickSearch);
        }
    });

    const prevScrollBtns = document.querySelectorAll('.scroll-btn.prev');
    const nextScrollBtns = document.querySelectorAll('.scroll-btn.next');

    prevScrollBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const row = document.getElementById(targetId);
            if (row) row.scrollBy({ left: -row.clientWidth * 0.8, behavior: 'smooth' });
        });
    });

    nextScrollBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const row = document.getElementById(targetId);
            if (row) row.scrollBy({ left: row.clientWidth * 0.8, behavior: 'smooth' });
        });
    });

    if (elements.toggleFilterBtn && elements.filterPanel) {
        elements.toggleFilterBtn.addEventListener('click', () => {
            const isHidden = elements.filterPanel.classList.toggle('hidden');
            elements.toggleFilterBtn.classList.toggle('active');
            elements.toggleFilterBtn.setAttribute('aria-expanded', String(!isHidden));
        });
    }

    if (elements.applyFiltersBtn) {
        elements.applyFiltersBtn.addEventListener('click', () => {
            state.filters.genre = elements.filterGenre.value;
            state.filters.country = elements.filterCountry.value;
            state.filters.year = elements.filterYear.value;
            state.filters.sort = elements.filterSort.value;

            navigateToPage(`danh-sach.html?type=filter&genre=${state.filters.genre}&country=${state.filters.country}&year=${state.filters.year}&sort=${state.filters.sort}`);
        });
    }

    if (elements.resetFiltersBtn) {
        elements.resetFiltersBtn.addEventListener('click', () => {
            elements.filterGenre.value = '';
            elements.filterCountry.value = '';
            elements.filterYear.value = '';
            elements.filterSort.value = 'modified.time';

            state.filters = { genre: '', country: '', year: '', sort: 'modified.time' };
            navigateToPage(`danh-sach.html?type=filter`);
        });
    }

    if (elements.gridPrevPage) {
        elements.gridPrevPage.addEventListener('click', () => {
            if (state.gridPage > 1) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('page', state.gridPage - 1);
                prefetchLinkResources(currentUrl.pathname + currentUrl.search);
                navigateToPage(currentUrl.pathname + currentUrl.search);
            }
        });
    }

    if (elements.gridNextPage) {
        elements.gridNextPage.addEventListener('click', () => {
            if (state.gridPage < state.gridTotalPages) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('page', state.gridPage + 1);
                prefetchLinkResources(currentUrl.pathname + currentUrl.search);
                navigateToPage(currentUrl.pathname + currentUrl.search);
            }
        });
    }

    initCategoryDeck();
}

// =========================================================================
// HELPER UTILITIES
// =========================================================================

/**
 * Format timestamp into friendly "X hours/days ago" text
 */
function formatTimeAgo(timestamp) {
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHr < 24) return `${diffHr} giờ trước`;
    return `${diffDay} ngày trước`;
}

// =========================================================================
// GSAP ANIMATIONS INITS
// =========================================================================
function initGSAPAnimations() {
    if (!ENABLE_GSAP || !window.gsap) return;
    
    // Register ScrollTrigger
    if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    // Ensure header elements are immediately fully visible and at their correct positions, no flashing animations
    gsap.set('.navbar .logo', { opacity: 1, x: 0 });
    gsap.set('.nav-links a', { opacity: 1, y: 0 });
    gsap.set('.nav-controls > *', { opacity: 1, scale: 1 });
}

// =========================================================================
// ROPHIM CUSTOM DYNAMIC UTILITIES & INTERACTIONS
// =========================================================================

/**
 * Populate dynamic Thể loại & Quốc gia dropdown links in Navbar
 */
async function populateNavDropdowns() {
    if (!elements.dropdownTheLoai || !elements.dropdownQuocGia) return;

    elements.dropdownTheLoai.innerHTML = Object.entries(GENRE_MAP).map(([slug, name]) => `
        <a href="danh-sach.html?type=the-loai&keyword=${escapeHTML(slug)}" data-slug="${escapeHTML(slug)}" class="dropdown-genre-link">${escapeHTML(name)}</a>
    `).join('');

    elements.dropdownQuocGia.innerHTML = Object.entries(COUNTRY_MAP).map(([slug, name]) => `
        <a href="danh-sach.html?type=quoc-gia&keyword=${escapeHTML(slug)}" data-slug="${escapeHTML(slug)}" class="dropdown-country-link">${escapeHTML(name)}</a>
    `).join('');

    elements.dropdownTheLoai.querySelectorAll('.dropdown-genre-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            navigateToPage(`danh-sach.html?type=the-loai&keyword=${link.dataset.slug}`);
        });
    });

    elements.dropdownQuocGia.querySelectorAll('.dropdown-country-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            navigateToPage(`danh-sach.html?type=quoc-gia&keyword=${link.dataset.slug}`);
        });
    });
}

/**
 * Initialize "Bạn đang quan tâm gì?" gradient category card click triggers
 */
function initCategoryDeck() {
    const deckCards = document.querySelectorAll('.deck-card');
    deckCards.forEach(card => {
        const warmDeckCard = () => {
            const genreSlug = card.getAttribute('data-genre');
            if (genreSlug) queueListPagePrefetch('the-loai', genreSlug, 1, 8);
        };
        card.addEventListener('click', () => {
            const genreSlug = card.getAttribute('data-genre');
            if (genreSlug) {
                warmDeckCard();
                navigateToPage(`danh-sach.html?type=the-loai&keyword=${genreSlug}`);
            }
        });
        if (shouldUsePassiveIntentPrefetch()) {
            card.addEventListener('pointerenter', warmDeckCard, { passive: true });
            card.addEventListener('touchstart', warmDeckCard, { passive: true });
            card.addEventListener('focusin', warmDeckCard);
        }
    });
}

// Carousel state variables for auto-slide
let currentHeroIndex = 0;
let heroInterval = null;

function startHeroAutoPlay(movies) {
    if (heroInterval) {
        clearInterval(heroInterval);
    }
    heroInterval = setInterval(() => {
        currentHeroIndex = (currentHeroIndex + 1) % movies.length;
        sessionStorage.setItem('featured_movie_index', currentHeroIndex); // Persist index on auto-slide
        const thumbItems = elements.heroThumbs ? elements.heroThumbs.querySelectorAll('.hero-thumb-item') : [];
        if (thumbItems[currentHeroIndex]) {
            // Programmatically click next thumbnail
            thumbItems[currentHeroIndex].click();
        }
    }, 6000); // Switch slide every 6 seconds
}

/**
 * Renders the 5 slide selector thumbnails on the right of the Hero banner
 */
function setupHeroSwitcher(movies) {
    if (!elements.heroThumbs || movies.length === 0) return;

    elements.heroThumbs.innerHTML = '';
    movies.forEach((movie, index) => {
        const thumbUrl = getImageUrl(movie.thumb_url || movie.poster_url, 'assets/logo.png', { width: 240, quality: 70 });
        const year = movie.year || 'N/A';
        const quality = movie.quality || 'HD';
        const name = escapeHTML(movie.name);
        
        const item = document.createElement('div');
        item.className = `hero-thumb-item`;
        item.innerHTML = `
            <img src="${thumbUrl}" alt="${name}" class="hero-thumb-img" loading="lazy" decoding="async" onerror="this.src='assets/logo.png';">
            <div class="hero-thumb-info">
                <span class="hero-thumb-title" title="${name}">${name}</span>
                <span class="hero-thumb-meta">${escapeHTML(year)} &bull; <span class="badge-quality">${escapeHTML(quality)}</span></span>
            </div>
        `;

        item.addEventListener('click', () => {
            currentHeroIndex = index; // Update index
            sessionStorage.setItem('featured_movie_index', index); // Persist index on click
            startHeroAutoPlay(movies); // Reset auto-play interval

            // Remove active from all thumbs
            elements.heroThumbs.querySelectorAll('.hero-thumb-item').forEach(t => t.classList.remove('active'));
            item.classList.add('active');

            // Call setupHeroSection directly (which handles smooth cross-fade background and text transitions)
            setupHeroSection(movie);
            warmMovieIntent(movie, { priority: 9, includeTmdbImages: true, withPosterImages: true });
        });

        elements.heroThumbs.appendChild(item);
    });

    // Populate the stored movie index on hero initial load or default to 0
    let startIndex = parseInt(sessionStorage.getItem('featured_movie_index')) || 0;
    if (startIndex < 0 || startIndex >= movies.length) {
        startIndex = 0;
    }

    const thumbItems = elements.heroThumbs.querySelectorAll('.hero-thumb-item');
    if (thumbItems[startIndex]) {
        thumbItems[startIndex].classList.add('active');
    }
    setupHeroSection(movies[startIndex]);
    warmMovieIntent(movies[startIndex], { priority: 9, includeTmdbImages: true, withPosterImages: true });
    const nextHeroMovie = movies[(startIndex + 1) % movies.length];
    if (nextHeroMovie && nextHeroMovie.slug !== movies[startIndex].slug) {
        warmMovieIntent(nextHeroMovie, { priority: 4, withPosterImages: true });
    }

    // Start auto-play carousel from the restored index
    currentHeroIndex = startIndex;
    startHeroAutoPlay(movies);
}

/**
 * Membership Management System (Mock login and session storage)
 */
const sessionManager = {
    init() {
        const savedUser = localStorage.getItem('user_session');
        if (savedUser) {
            state.user = JSON.parse(savedUser);
            this.updateUI();
        }
    },
    login(username) {
        state.user = {
            username: username,
            displayName: username.split('@')[0],
            avatar: 'assets/logo.png'
        };
        localStorage.setItem('user_session', JSON.stringify(state.user));
        this.updateUI();
        this.closeLoginModal();
        showToast(`Đăng nhập thành công! Chào mừng ${state.user.displayName}.`, 'success');
    },
    logout() {
        state.user = null;
        localStorage.removeItem('user_session');
        this.updateUI();
        showToast('Đã đăng xuất.');
    },
    updateUI() {
        if (!elements.navMemberBtn) return;
        
        if (state.user) {
            elements.navMemberBtn.innerHTML = `
                <img src="${state.user.avatar}" alt="${escapeHTML(state.user.displayName)}" class="nav-avatar" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary);">
                <span>${escapeHTML(state.user.displayName)}</span>
            `;
        } else {
            elements.navMemberBtn.innerHTML = `
                <i data-lucide="user"></i>
                <span>Thành viên</span>
            `;
            lucide.createIcons();
        }
    },
    openLoginModal() {
        if (!elements.loginModal) return;
        elements.loginModal.classList.add('active');
        elements.loginModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (elements.loginUsername) elements.loginUsername.focus();
    },
    closeLoginModal() {
        if (!elements.loginModal) return;
        elements.loginModal.classList.remove('active');
        elements.loginModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (elements.loginForm) elements.loginForm.reset();
    }
};

// =========================================================================
// MULTI-PAGE CONTROLLERS
// =========================================================================

async function fetchMovieDetailsPage(slug) {
    const detailsBody = document.getElementById('detailsBody');
    const detailsLoading = document.getElementById('detailsLoading');
    if (!detailsBody) return;

    detailsBody.innerHTML = '';
    const cachedData = getCachedApiData(OP_DETAILS, { slug }, { allowStale: true });
    if (cachedData && cachedData.data && cachedData.data.item) {
        const cachedImages = selectTmdbImages(getCachedApiData(OP_IMAGES, { slug }, { allowStale: true }));
        if (detailsLoading) detailsLoading.classList.add('hidden');
        renderMovieDetailsPage(cachedData.data.item, cachedImages.backdrop, cachedImages.poster);
        return;
    }

    if (detailsLoading) detailsLoading.classList.remove('hidden');

    // Parallel fetch for details and images
    const [data, imageData] = await Promise.all([
        fetchAPI(OP_DETAILS, { slug }),
        fetchAPI(OP_IMAGES, { slug })
    ]);

    if (detailsLoading) detailsLoading.classList.add('hidden');

    if (data && data.data && data.data.item) {
        let tmdbBackdrop = null;
        let tmdbPoster = null;
        if (imageData && imageData.data && imageData.data.images) {
            const backdrops = imageData.data.images.filter(img => img.type === 'backdrop');
            const posters = imageData.data.images.filter(img => img.type === 'poster');
            if (backdrops.length > 0) {
                tmdbBackdrop = backdrops[0].file_path;
            }
            if (posters.length > 0) {
                tmdbPoster = posters[0].file_path;
            }
        }
        renderMovieDetailsPage(data.data.item, tmdbBackdrop, tmdbPoster);
    } else {
        detailsBody.innerHTML = `
            <div class="no-results" style="border:none;">
                <p>Không thể tải thông tin bộ phim này. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

function renderMovieDetailsPage(movie, tmdbBackdrop = null, tmdbPoster = null) {
    const detailsBody = document.getElementById('detailsBody');
    if (!detailsBody) return;

    const history = libraryManager.getHistory();
    const movieHistory = history.find(h => h.slug === movie.slug);
    const lastEp = movieHistory ? movieHistory.episodeIndex : 0;
    const lastSv = movieHistory ? movieHistory.serverIndex : 0;

    const posterUrl = getImageUrl(tmdbPoster || movie.poster_url, 'assets/logo.png', { width: 480, quality: 76 });
    const thumbUrl = getImageUrl(tmdbBackdrop || movie.thumb_url || movie.poster_url, 'assets/logo.png', { width: 1280, quality: 76 });
    const backdropImg = getImageUrl(tmdbBackdrop || movie.thumb_url || movie.poster_url, posterUrl, { width: 1280, quality: 76 });

    const genres = movie.category ? movie.category.map(c => c.name).join(', ') : 'N/A';
    const countries = movie.country ? movie.country.map(c => c.name).join(', ') : 'N/A';
    const actors = movie.actor && movie.actor[0] !== "" ? movie.actor.join(', ') : 'Đang cập nhật';
    const directors = movie.director && movie.director[0] !== "" ? movie.director.join(', ') : 'Đang cập nhật';
    const description = movie.content || 'Nội dung đang được cập nhật.';
    const formattedDate = movie.modified?.time ? new Date(movie.modified.time).toLocaleDateString('vi-VN') : 'Đang cập nhật';

    // Check watchlist status
    const inWatchlist = libraryManager.isInWatchlist(movie.slug);
    const watchBtnClass = inWatchlist ? 'watchlist-toggle-btn in-watchlist' : 'watchlist-toggle-btn';
    const watchBtnText = inWatchlist ? 'Đã lưu yêu thích' : 'Thêm vào yêu thích';
    const watchBtnIcon = inWatchlist ? 'check-circle-2' : 'heart';

    let episodes = movie.episodes || [];
    let episodesHtml = '';
    if (episodes.length > 0) {
        episodesHtml = `
            <div class="detail-episodes-section" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                <h3 class="episode-title" style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">
                    Danh Sách Tập Phim:
                </h3>
        `;

        if (episodes.length > 1) {
            episodesHtml += `
                <div class="server-tabs" style="margin-bottom: 1.5rem;">
                    ${episodes.map((server, idx) => `
                        <button class="server-tab ${idx === 0 ? 'active' : ''}" data-server-target="${idx}" onclick="switchDetailServer(this, ${idx})">
                            ${escapeHTML(server.server_name || `Server ${idx + 1}`)}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        episodes.forEach((server, sIdx) => {
            const serverData = server.server_data || [];
            episodesHtml += `
                <div class="detail-episode-grid ${sIdx === 0 ? '' : 'hidden'}" id="detailEpisodeGrid-${sIdx}">
                    ${generateEpisodesHTML(movie.slug, serverData, -1, sIdx, 'link')}
                </div>
            `;
        });

        episodesHtml += `</div>`;
    }

    const html = `
        <div class="modal-backdrop" style="background-image: url('${backdropImg}')"></div>
        <div class="modal-scroll-content">
            <div class="modal-header-info">
                <img src="${posterUrl}" alt="${escapeHTML(movie.name)}" class="modal-poster" decoding="async" onerror="this.src='assets/logo.png';">
                
                <div class="modal-meta-header">
                    <div class="modal-title-wrapper">
                        <div>
                            <h2 class="modal-title">${escapeHTML(movie.name)}</h2>
                            <p class="modal-origin-title">${escapeHTML(movie.origin_name || '')} (${escapeHTML(movie.year || 'N/A')})</p>
                        </div>
                    </div>
                    
                    <div class="modal-tags">
                        <span class="tag">${escapeHTML(movie.quality || 'HD')}</span>
                        <span class="tag">${escapeHTML(movie.lang || 'Vietsub')}</span>
                        <span class="tag">${escapeHTML(movie.time || '? phút')}</span>
                        <span class="tag">${escapeHTML(movie.episode_current || 'Tập 1')}</span>
                    </div>
                    
                    <div class="modal-stats">
                        <div class="stat-item">
                            <i data-lucide="calendar"></i>
                            <span>Năm: ${escapeHTML(movie.year || 'N/A')}</span>
                        </div>
                        <div class="stat-item">
                            <i data-lucide="globe"></i>
                            <span>Quốc gia: ${escapeHTML(countries)}</span>
                        </div>
                    </div>

                    <div class="modal-actions-group">
                        <a href="xem-phim.html?slug=${movie.slug}&ep=${lastEp}&sv=${lastSv}" class="btn btn-primary" style="text-decoration: none;">
                            <i data-lucide="play"></i> XEM PHIM
                        </a>
                        <button class="${watchBtnClass} btn" id="watchlistToggleBtn">
                            <i data-lucide="${watchBtnIcon}"></i>
                            <span>${watchBtnText}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="modal-content-details">
                <div class="modal-synopsis">
                    <h3>Tóm Tắt Nội Dung</h3>
                    <p>${description}</p>
                </div>
                
                <div class="modal-info-list">
                    <div class="info-row">
                        <span class="info-label">Thể loại</span>
                        <span class="info-value">${escapeHTML(genres)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Đạo diễn</span>
                        <span class="info-value">${escapeHTML(directors)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Diễn viên</span>
                        <span class="info-value">${escapeHTML(actors)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cập nhật cuối</span>
                        <span class="info-value">${escapeHTML(formattedDate)}</span>
                    </div>
                </div>
            </div>

            ${episodesHtml}
        </div>
    `;

    detailsBody.innerHTML = html;
    lucide.createIcons();

    // Watchlist Favorite Button Action
    const watchlistToggleBtn = document.getElementById('watchlistToggleBtn');
    if (watchlistToggleBtn) {
        setWatchlistButtonState(watchlistToggleBtn, inWatchlist, movie.slug);
        watchlistToggleBtn.addEventListener('click', () => {
            const isFav = libraryManager.isInWatchlist(movie.slug);
            if (isFav) {
                libraryManager.removeFromWatchlist(movie.slug);
                setWatchlistButtonState(watchlistToggleBtn, false, movie.slug);
                showToast('Đã xóa khỏi tủ phim.', 'remove');
            } else {
                libraryManager.addToWatchlist(movie);
                setWatchlistButtonState(watchlistToggleBtn, true, movie.slug);
                showToast('Đã thêm vào tủ phim.', 'success');
            }
            lucide.createIcons();
        });
    }
}

window.switchDetailServer = (btn, svIdx) => {
    btn.parentElement.querySelectorAll('.server-tab').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');

    btn.parentElement.parentElement.querySelectorAll('.detail-episode-grid').forEach(grid => grid.classList.add('hidden'));
    
    const targetGrid = document.getElementById(`detailEpisodeGrid-${svIdx}`);
    if (targetGrid) targetGrid.classList.remove('hidden');
};



async function playMovieFromSlugPage(slug, episodeIndex = 0, serverIndex = 0) {
    const playerBody = document.getElementById('playerBody');
    if (!playerBody) return;

    const cachedData = getCachedApiData(OP_DETAILS, { slug }, { allowStale: true });
    if (cachedData && cachedData.data && cachedData.data.item) {
        const cachedImages = selectTmdbImages(getCachedApiData(OP_IMAGES, { slug }, { allowStale: true }));
        renderMoviePlayerPage(cachedData.data.item, episodeIndex, serverIndex, cachedImages.backdrop);
        return;
    }
    
    playerBody.innerHTML = '<div class="loader" style="margin: 4rem auto;"></div>';
    const data = await fetchAPI(OP_DETAILS, { slug });
    
    if (data && data.data && data.data.item) {
        const cachedImages = selectTmdbImages(getCachedApiData(OP_IMAGES, { slug }, { allowStale: true }));
        const tmdbBackdrop = cachedImages.backdrop;
        renderMoviePlayerPage(data.data.item, episodeIndex, serverIndex, tmdbBackdrop);
    } else {
        playerBody.innerHTML = `
            <div class="no-results" style="border:none; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <i data-lucide="alert-circle" style="width:48px; height:48px; color:var(--text-muted);"></i>
                <p style="margin-top:10px;">Rất tiếc! Không thể kết nối tới server phát phim.</p>
                <a href="index.html" class="btn btn-sm btn-primary" style="margin-top:15px; text-decoration:none;">Về Trang Chủ</a>
            </div>
        `;
        lucide.createIcons();
    }
}

async function renderMoviePlayerPage(movie, episodeIndex = 0, serverIndex = 0, tmdbBackdrop = null) {
    const playerBody = document.getElementById('playerBody');
    if (!playerBody) return;

    const playback = getMoviePlaybackState(movie, episodeIndex, serverIndex);
    let { episodes, serverData, currentEpisode } = playback;

    const playerUrl = !playback.isUnavailable ? createPlayerUrl(movie.slug, episodeIndex, serverIndex) : null;

    const movieName = movie.name;
    const epName = playerUrl && currentEpisode?.name ? currentEpisode.name : (playerUrl ? `Tập ${episodeIndex + 1}` : PLAYER_UPDATE_MESSAGE);
    
    // Save to Watch History
    if (playerUrl) libraryManager.addToHistory(movie, epName, episodeIndex, serverIndex);

    const posterUrl = getImageUrl(movie.poster_url, 'assets/logo.png', { width: 480, quality: 76 });
    const backdropImg = getImageUrl(tmdbBackdrop || movie.thumb_url || movie.poster_url, posterUrl, { width: 1280, quality: 76 });

    let html = `
        <div class="modal-backdrop" style="background-image: url('${backdropImg}')"></div>
        <div class="modal-scroll-content">
            <div class="player-movie-info" style="margin-bottom: 1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span class="player-kicker" style="color:var(--primary); font-weight:700; text-transform:uppercase; font-size:0.8rem; letter-spacing:1px;">Đang phát</span>
                        <h2 class="player-movie-title" style="margin: 0.25rem 0 0.5rem 0; font-size: 1.75rem; font-weight: 800;">${escapeHTML(movieName)}</h2>
                        <p class="player-episode-info" style="color: var(--text-secondary); font-size: 0.95rem;">
                            Tập phim hiện tại: <span style="color: var(--primary); font-weight: 600;">${escapeHTML(epName)}</span>
                        </p>
                    </div>
                    <a href="phim.html?slug=${movie.slug}" class="btn btn-sm btn-outline" style="text-decoration:none;">
                        <i data-lucide="info"></i> Chi tiết phim
                    </a>
                </div>
            </div>

            <div class="video-container">
                ${playerUrl ? createPlayerFrameHTML(playerUrl) : renderPlayerUnavailableBlock()}
            </div>
    `;

    if (episodes.length > 1) {
        html += `
            <div class="server-section" style="margin-top:2rem;">
                <h3 class="episode-title" style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Nguồn phát:</h3>
                <div class="server-tabs">
                    ${episodes.map((server, idx) => `
                        <button class="server-tab ${idx === serverIndex ? 'active' : ''}" onclick="changeEpisode('${movie.slug}', ${episodeIndex}, ${idx})">
                            ${escapeHTML(server.server_name || `Server ${idx + 1}`)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (serverData.length > 1) {
        html += `
            <div class="episode-section" style="margin-top:2rem;">
                <h3 class="episode-title" style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Chọn Tập Phim:</h3>
                ${generateEpisodesHTML(movie.slug, serverData, episodeIndex, serverIndex, 'button')}
            </div>
        `;
    }

    // Close modal-scroll-content
    html += `</div>`;

    playerBody.innerHTML = html;
    bindPlayerFrameLoader(playerBody);
    lucide.createIcons();
}

window.changeEpisode = (slug, epIndex, svIndex = 0) => {
    navigateToPage(`xem-phim.html?slug=${slug}&ep=${epIndex}&sv=${svIndex}`);
};

function loadLibraryPage() {
    libraryManager.init();
    libraryManager.updateLibraryCounters();
    
    // Check if query param specifies history
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab') || 'watchlist';
    
    const tabBtn = document.querySelector(`.lib-tab-btn[data-tab="${tab}"]`);
    if (tabBtn) {
        tabBtn.click();
    } else {
        // Fallback in case buttons aren't ready
        if (tab === 'watchlist') {
            libraryManager.renderWatchlist();
        } else {
            libraryManager.renderHistory();
        }
    }
}

// =========================================================================
// ROPHIM EPISODE SELECTOR GROUPS/TABS HELPER
// =========================================================================
function generateEpisodesHTML(movieSlug, serverData, activeEpIndex, serverIndex, mode = 'button') {
    if (!serverData || serverData.length === 0) return '';

    const totalEpisodes = serverData.length;

    // For 40 or fewer episodes, show single grid directly
    if (totalEpisodes <= 40) {
        return `
            <div class="episode-grid">
                ${serverData.map((ep, idx) => {
                    const displayName = ep.name || `Tập ${idx + 1}`;
                    const activeClass = idx === activeEpIndex ? 'active' : '';
                    if (mode === 'link') {
                        return `
                            <a href="xem-phim.html?slug=${movieSlug}&ep=${idx}&sv=${serverIndex}" class="episode-btn ${activeClass}" style="text-decoration: none; text-align: center;">
                                ${escapeHTML(displayName)}
                            </a>
                        `;
                    } else {
                        return `
                            <button class="episode-btn ${activeClass}" onclick="changeEpisode('${movieSlug}', ${idx}, ${serverIndex})">
                                ${escapeHTML(displayName)}
                            </button>
                        `;
                    }
                }).join('')}
            </div>
        `;
    }

    // Split into ranges of 50
    const rangeSize = 50;
    const ranges = [];
    for (let i = 0; i < totalEpisodes; i += rangeSize) {
        const start = i + 1;
        const end = Math.min(i + rangeSize, totalEpisodes);
        ranges.push({ start, end, startIndex: i, endIndex: end - 1 });
    }

    // Find which range contains the active episode
    let activeRangeIdx = ranges.findIndex(r => activeEpIndex >= r.startIndex && activeEpIndex <= r.endIndex);
    if (activeRangeIdx === -1) activeRangeIdx = 0;

    // Unique ID for grids to prevent conflict if multiple selectors exist
    const selectorId = `${movieSlug}-${serverIndex}`;

    // Generate tabs HTML
    const tabsHtml = `
        <div class="episode-range-tabs">
            ${ranges.map((r, rIdx) => `
                <button class="range-tab-btn ${rIdx === activeRangeIdx ? 'active' : ''}" 
                        data-range-target="${selectorId}-${rIdx}" 
                        onclick="switchEpisodeRange(this, '${selectorId}-${rIdx}')">
                    ${r.start} - ${r.end}
                </button>
            `).join('')}
        </div>
    `;

    // Generate grids HTML
    const gridsHtml = ranges.map((r, rIdx) => {
        const rangeEpisodes = serverData.slice(r.startIndex, r.endIndex + 1);
        const isHidden = rIdx === activeRangeIdx ? '' : 'hidden';

        return `
            <div class="episode-grid range-episode-grid ${isHidden}" id="episodeGrid-${selectorId}-${rIdx}">
                ${rangeEpisodes.map((ep, subIdx) => {
                    const idx = r.startIndex + subIdx;
                    const displayName = ep.name || `Tập ${idx + 1}`;
                    const activeClass = idx === activeEpIndex ? 'active' : '';
                    if (mode === 'link') {
                        return `
                            <a href="xem-phim.html?slug=${movieSlug}&ep=${idx}&sv=${serverIndex}" class="episode-btn ${activeClass}" style="text-decoration: none; text-align: center;">
                                ${escapeHTML(displayName)}
                            </a>
                        `;
                    } else {
                        return `
                            <button class="episode-btn ${activeClass}" onclick="changeEpisode('${movieSlug}', ${idx}, ${serverIndex})">
                                ${escapeHTML(displayName)}
                            </button>
                        `;
                    }
                }).join('')}
            </div>
        `;
    }).join('');

    return `
        <div class="episode-range-selector">
            ${tabsHtml}
            <div class="episode-grids-container">
                ${gridsHtml}
            </div>
        </div>
    `;
}

window.switchEpisodeRange = (btn, targetId) => {
    const parent = btn.parentElement;
    parent.querySelectorAll('.range-tab-btn').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');

    const selectorContainer = parent.closest('.episode-range-selector');
    if (selectorContainer) {
        selectorContainer.querySelectorAll('.range-episode-grid').forEach(grid => grid.classList.add('hidden'));
        const targetGrid = selectorContainer.querySelector(`#episodeGrid-${targetId}`);
        if (targetGrid) targetGrid.classList.remove('hidden');
    }
};

// =========================================================================
// SILENT BACKGROUND PREFETCHING SYSTEM
// =========================================================================
const prefetchQueue = [];
let prefetchTimeout = null;
const pageCache = new Map();
let isNavigating = false;
let pendingNavigation = null;
const pagePrefetchLinks = new Set();

// Silent image prefetch helper
function prefetchImage(src) {
    if (!PREFETCH_CONFIG.imagePrefetchEnabled || !src || shouldUseConservativeNetworkMode()) return;
    const finalUrl = getImageUrl(src);
    if (prefetchImage.cache[finalUrl]) return;
    prefetchImage.cache[finalUrl] = true;

    const img = new Image();
    img.src = finalUrl;
}
prefetchImage.cache = {};

function queueApiPrefetch(endpoint, params = {}, options = {}) {
    try {
        const priority = Number(options.priority || 0);
        if (!PREFETCH_CONFIG.apiPrefetchEnabled && !options.force) return;
        if (shouldUseConservativeNetworkMode() && !options.allowOnSlow) return;
        if (document.visibilityState === 'hidden' && priority < 9) return;

        const { cacheKey } = buildApiRequest(endpoint, params);
        if (readApiCache(cacheKey) || apiInFlightRequests.has(cacheKey)) return;
        if (prefetchRequestsUsed >= PREFETCH_CONFIG.maxRequestsPerPage && priority < 9) return;

        const alreadyQueued = prefetchQueue.some(item => 
            item.cacheKey === cacheKey
        );
        if (alreadyQueued) return;

        if (prefetchQueue.length >= PREFETCH_CONFIG.maxQueueSize) {
            prefetchQueue.sort((a, b) => b.priority - a.priority);
            const lowest = prefetchQueue[prefetchQueue.length - 1];
            if (!lowest || priority <= lowest.priority) return;
            prefetchQueue.pop();
        }

        prefetchQueue.push({ endpoint, params, cacheKey, priority });
        prefetchQueue.sort((a, b) => b.priority - a.priority);
        triggerPrefetchQueue();
    } catch (e) {
        console.error('Queue prefetch error:', e);
    }
}

function triggerPrefetchQueue() {
    if (prefetchTimeout) return;

    prefetchTimeout = setTimeout(() => {
        if (document.visibilityState === 'hidden') {
            prefetchTimeout = null;
            return;
        }

        if (prefetchQueue.length === 0) {
            prefetchTimeout = null;
            return;
        }

        const runFetch = async () => {
            const item = prefetchQueue.shift();
            if (item) {
                try {
                    prefetchRequestsUsed += 1;
                    await fetchAPI(item.endpoint, item.params);
                } catch (e) {
                    console.warn('Prefetch failed:', e);
                }
            }
            prefetchTimeout = null;
            triggerPrefetchQueue();
        };

        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => runFetch(), { timeout: 1800 });
        } else {
            runFetch();
        }
    }, PREFETCH_CONFIG.delayMs);
}

function initPrefetchSystem() {
    if (shouldUseConservativeNetworkMode()) {
        console.log('[Prefetch] Slow connection or Save-Data active. Skipping aggressive prefetching.');
        return;
    }

    if (!PREFETCH_CONFIG.autoWarmOnLoad && !PREFETCH_CONFIG.prefetchHtmlOnLoad) return;

    const pagesToPrefetch = [
        '/',
        '/danh-sach',
        '/tu-phim'
    ];
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    if (PREFETCH_CONFIG.prefetchHtmlOnLoad) {
        pagesToPrefetch.forEach(p => {
            const cleanP = p.replace(/^\//, '');
            const cleanCurrent = currentPath.replace(/^\//, '');
            const isCurrentHome = p === '/' && (cleanCurrent === '' || cleanCurrent === 'index.html');
            if (cleanP !== cleanCurrent && !isCurrentHome && !pagePrefetchLinks.has(p)) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = p;
                document.head.appendChild(link);
                pagePrefetchLinks.add(p);
                
                // Also fetch to pageCache for SPA instant swap
                prefetchPageHTML(p);
            }
        });
    }

    if (!PREFETCH_CONFIG.autoWarmOnLoad) return;

    // Warm the list pages users are most likely to open from the homepage/header.
    queueApiPrefetch(OP_HOME, { page: 1, limit: 24 }, { priority: 7 });
    queueApiPrefetch(OP_PHIM_BO, { page: 1, limit: 24 }, { priority: 6 });
    queueApiPrefetch(OP_PHIM_LE, { page: 1, limit: 24 }, { priority: 6 });
    queueApiPrefetch(OP_PHIM_CHIEU_RAP, { page: 1, limit: 24 }, { priority: 6 });

    for (let p = 2; p <= 1 + PREFETCH_CONFIG.gridPagesAhead; p++) {
        queueApiPrefetch(OP_HOME, { page: p, limit: 24 }, { priority: 8 });
    }

    document.querySelectorAll('.deck-card[data-genre]').forEach((card, index) => {
        if (index < PREFETCH_CONFIG.homeDeckPreviewLimit) {
            queueApiPrefetch(OP_GENRE, { slug: card.getAttribute('data-genre'), page: 1, limit: 24 }, { priority: 5 });
        }
    });

    // Warm only the first visible menu destinations. The rest are fetched on hover/touch/focus.
    fetchAPI(OP_GENRES).then(resGenres => {
        if (resGenres && resGenres.data && resGenres.data.items) {
            resGenres.data.items.slice(0, PREFETCH_CONFIG.dropdownPreviewLimit).forEach(g => {
                queueApiPrefetch(OP_GENRE, { slug: g.slug, page: 1, limit: 24 }, { priority: 3 });
            });
        }
    }).catch(e => console.warn('Genres prefetch error:', e));

    fetchAPI(OP_COUNTRIES).then(resCountries => {
        if (resCountries && resCountries.data && resCountries.data.items) {
            resCountries.data.items.slice(0, PREFETCH_CONFIG.dropdownPreviewLimit).forEach(c => {
                queueApiPrefetch(OP_COUNTRY, { slug: c.slug, page: 1, limit: 24 }, { priority: 3 });
            });
        }
    }).catch(e => console.warn('Countries prefetch error:', e));
}

window.addEventListener('load', () => {
    setTimeout(initPrefetchSystem, 2000);
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') triggerPrefetchQueue();
});

// =========================================================================
// CUSTOM CLIENT-SIDE ROUTER & DYNAMIC TRANSITIONS
// =========================================================================

const ROUTE_PAGE_ALIASES = new Map([
    ['/index.html', '/'],
    ['/index.min.html', '/'],
    ['/danh-sach.html', '/danh-sach'],
    ['/danh-sach.min.html', '/danh-sach'],
    ['/phim.html', '/phim'],
    ['/phim.min.html', '/phim'],
    ['/xem-phim.html', '/xem-phim'],
    ['/xem-phim.min.html', '/xem-phim'],
    ['/tu-phim.html', '/tu-phim'],
    ['/tu-phim.min.html', '/tu-phim']
]);

function normalizeRouteUrl(urlStr) {
    const url = new URL(urlStr, window.location.href);
    const normalizedPath = url.pathname.replace(/\/{2,}/g, '/');
    url.pathname = ROUTE_PAGE_ALIASES.get(normalizedPath) || normalizedPath;
    return url;
}

function shouldHandleLink(link) {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return false;
    if (link.getAttribute('target') === '_blank') return false;
    
    try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        
        const path = url.pathname;
        const pageName = path.split('/').pop().replace(/\.html$/, '').replace(/\.min$/, '');
        return pageName === '' || 
               pageName === 'index' || 
               pageName === 'danh-sach' || 
               pageName === 'phim' || 
               pageName === 'xem-phim' || 
               pageName === 'tu-phim';
    } catch (e) {
        return false;
    }
}

async function prefetchPageHTML(urlStr) {
    try {
        if (!PREFETCH_CONFIG.htmlPrefetchEnabled) return;
        const targetUrl = normalizeRouteUrl(urlStr);
        const cacheKey = targetUrl.pathname.replace(/\.min\.html$/, '.html').replace(/\.html$/, '');
        if (pageCache.has(cacheKey)) return;

        const res = await fetch(targetUrl.pathname);
        if (res.ok) {
            const html = await res.text();
            pageCache.set(cacheKey, html);
        }
    } catch (e) {
        console.warn('HTML prefetch failed:', e);
    }
}

function prefetchLinkResources(urlStr) {
    try {
        if (!PREFETCH_CONFIG.htmlPrefetchEnabled && !PREFETCH_CONFIG.apiPrefetchEnabled) return;
        const targetUrl = normalizeRouteUrl(urlStr);
        
        prefetchPageHTML(urlStr);

        const pageName = targetUrl.pathname.split('/').pop().replace(/\.html$/, '').replace(/\.min$/, '');
        const params = targetUrl.searchParams;

        if (pageName === '' || pageName === 'index') {
            queueApiPrefetch(OP_HOME, { page: 1, limit: 12 }, { priority: 8 });
            queueApiPrefetch(OP_PHIM_LE, { page: 1, limit: 12 }, { priority: 7 });
            queueApiPrefetch(OP_PHIM_BO, { page: 1, limit: 12 }, { priority: 7 });
            queueApiPrefetch(OP_PHIM_CHIEU_RAP, { page: 1, limit: 12 }, { priority: 7 });
        } else if (pageName === 'danh-sach') {
            const type = params.get('type') || 'phim-moi-cap-nhat';
            const keyword = params.get('keyword') || '';
            const page = parseInt(params.get('page')) || 1;
            
            let endpoint = '';
            let apiParams = { page: page, limit: 24 };

            if (type === 'phim-bo') endpoint = OP_PHIM_BO;
            else if (type === 'phim-le') endpoint = OP_PHIM_LE;
            else if (type === 'phim-chieu-rap') endpoint = OP_PHIM_CHIEU_RAP;
            else if (type === 'phim-moi-cap-nhat') endpoint = OP_HOME;
            else if (type === 'the-loai') {
                endpoint = OP_GENRE;
                apiParams.slug = keyword;
            } else if (type === 'quoc-gia') {
                endpoint = OP_COUNTRY;
                apiParams.slug = keyword;
            }
            else if (type === 'search') {
                endpoint = OP_SEARCH;
                apiParams.keyword = keyword;
            } else if (type === 'filter') {
                const genre = params.get('genre') || '';
                const country = params.get('country') || '';
                const year = params.get('year') || '';
                const sort = params.get('sort') || 'modified.time';
                
                if (genre) {
                    endpoint = OP_GENRE;
                    apiParams.slug = genre;
                } else if (country) {
                    endpoint = OP_COUNTRY;
                    apiParams.slug = country;
                } else {
                    endpoint = OP_HOME;
                }
                
                apiParams.sort_field = sort;
                if (genre) apiParams.category = genre;
                if (country) apiParams.country = country;
                if (year) apiParams.year = year;
            }

            if (endpoint) {
                queueApiPrefetch(endpoint, apiParams, { priority: 9 });
            }
        } else if (pageName === 'phim' || pageName === 'xem-phim') {
            const slug = params.get('slug');
            if (slug) {
                queueApiPrefetch(OP_DETAILS, { slug }, { priority: 10 });
                queueApiPrefetch(OP_IMAGES, { slug }, { priority: 9 });
            }
        }
    } catch (e) {
        console.error('Prefetch link resources error:', e);
    }
}

function finishNavigation() {
    isNavigating = false;
    if (!pendingNavigation) return;

    const nextNavigation = pendingNavigation;
    pendingNavigation = null;
    navigateToPage(nextNavigation.urlStr, nextNavigation.push);
}

async function navigateToPage(urlStr, push = true) {
    let targetUrl;

    if (isNavigating) {
        pendingNavigation = { urlStr, push };
        prefetchLinkResources(urlStr);
        return;
    }
    isNavigating = true;

    try {
        targetUrl = normalizeRouteUrl(urlStr);
        const navigationStartedAt = performance.now();
        const shouldProtectNavAnimation = previewNavigationHighlight(targetUrl);

        // Let the browser commit the pill's first frame before parsing or swapping a new page.
        if (shouldProtectNavAnimation) await waitForNextPaint();
        const path = targetUrl.pathname;
        const pageName = path.split('/').pop().replace(/\.html$/, '').replace(/\.min$/, '');
        const cacheKey = path.replace(/\.min\.html$/, '.html').replace(/\.html$/, '');

        let htmlText = pageCache.get(cacheKey);
        if (!htmlText) {
            const res = await fetch(targetUrl.pathname);
            if (!res.ok) throw new Error(`HTTP error fetching page: ${res.status}`);
            htmlText = await res.text();
            pageCache.set(cacheKey, htmlText);
        }

        // Parsing and routing can be expensive. Keep them out of the indicator's animation window.
        if (shouldProtectNavAnimation) await waitForNavIndicatorSettle(navigationStartedAt);

        const mainEl = document.querySelector('main.main-content');
        if (!mainEl) {
            window.location.href = targetUrl.pathname + targetUrl.search;
            finishNavigation();
            return;
        }
        
        const performSwap = () => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            const newMain = doc.querySelector('main.main-content');
            if (!newMain) {
                console.error('Target page lacks <main.main-content>');
                window.location.href = targetUrl.pathname + targetUrl.search;
                finishNavigation();
                return;
            }

            if (doc.title) document.title = doc.title;
            const newDescMeta = doc.querySelector('meta[name="description"]');
            const currentDescMeta = document.querySelector('meta[name="description"]');
            if (newDescMeta && currentDescMeta) {
                currentDescMeta.setAttribute('content', newDescMeta.getAttribute('content'));
            }

            // Handle heroSection dynamically (only on homepage)
            const newHero = doc.querySelector('#heroSection');
            const currentHero = document.querySelector('#heroSection');
            if (newHero) {
                if (currentHero) {
                    currentHero.innerHTML = newHero.innerHTML;
                    currentHero.className = newHero.className;
                    currentHero.style.display = '';
                } else {
                    mainEl.insertAdjacentHTML('beforebegin', newHero.outerHTML);
                }
            } else {
                if (currentHero) {
                    currentHero.remove();
                }
            }

            mainEl.innerHTML = newMain.innerHTML;
            mainEl.className = newMain.className;
            const styleAttr = newMain.getAttribute('style');
            if (styleAttr) {
                mainEl.setAttribute('style', styleAttr);
            } else {
                mainEl.removeAttribute('style');
            }

            updateDOMReferences();
            initDynamicPageEventListeners();
            runPageRouting(targetUrl);
            closeMobileMenu();

            if (window.lucide) {
                window.lucide.createIcons();
            }

            if (push) {
                window.history.pushState(null, doc.title || '', targetUrl.pathname + targetUrl.search);
            }
            
            // Reset scroll position to top instantly to prevent layout jump on navigation
            const prevScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, 0);
            document.documentElement.style.scrollBehavior = prevScrollBehavior;
        };

        if (ENABLE_GSAP && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.to(mainEl, {
                opacity: 0,
                y: -15,
                duration: 0.15,
                ease: 'power2.inOut',
                onComplete: () => {
                    performSwap();
                    gsap.fromTo(mainEl, 
                        { opacity: 0, y: 15 },
                        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.inOut', onComplete: finishNavigation }
                    );
                }
            });
        } else {
            performSwap();
            finishNavigation();
        }

    } catch (e) {
        console.error('Navigation error, falling back to full reload:', e);
        if (!targetUrl) targetUrl = normalizeRouteUrl(urlStr);
        window.location.href = targetUrl.pathname + targetUrl.search;
        finishNavigation();
    }
}

function updateDOMReferences() {
    elements.navbar = document.querySelector('.navbar');
    elements.logoLink = document.getElementById('logoLink');
    elements.navTrangChu = document.getElementById('navTrangChu');
    elements.navPhimMoi = document.getElementById('navPhimMoi');
    elements.navPhimBo = document.getElementById('navPhimBo');
    elements.navPhimLe = document.getElementById('navPhimLe');
    elements.navPhimChieuRap = document.getElementById('navPhimChieuRap');
    elements.navPhimDeCu = document.getElementById('navPhimDeCu');
    elements.navTopIMDb = document.getElementById('navTopIMDb');
    elements.navTheLoai = document.getElementById('navTheLoai');
    elements.navQuocGia = document.getElementById('navQuocGia');
    elements.dropdownTheLoai = document.getElementById('dropdownTheLoai');
    elements.dropdownQuocGia = document.getElementById('dropdownQuocGia');
    elements.navTuPhim = document.getElementById('navTuPhim');
    elements.navLinks = document.getElementById('navLinks');
    elements.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    elements.menuIconOpen = document.getElementById('menuIconOpen');
    elements.menuIconClose = document.getElementById('menuIconClose');
    
    elements.themeToggle = document.getElementById('themeToggle');
    
    elements.searchInput = document.getElementById('searchInput');
    elements.searchBtn = document.getElementById('searchBtn');

    elements.heroSection = document.getElementById('heroSection');
    elements.heroTitle = document.getElementById('heroTitle');
    elements.heroDesc = document.getElementById('heroDesc');
    elements.heroBtnPlay = document.getElementById('heroBtnPlay');
    elements.heroBtnInfo = document.getElementById('heroBtnInfo');
    elements.heroBtnFav = document.getElementById('heroBtnFav');
    elements.heroThumbs = document.getElementById('heroThumbs');

    elements.homePage = document.getElementById('homePage');
    elements.gridViewPage = document.getElementById('gridViewPage');
    elements.libraryPage = document.getElementById('libraryPage');

    elements.rowPhimMoi = document.getElementById('rowPhimMoi');
    elements.rowPhimLe = document.getElementById('rowPhimLe');
    elements.rowPhimBo = document.getElementById('rowPhimBo');
    elements.rowPhimChieuRap = document.getElementById('rowPhimChieuRap');

    elements.gridPageTitle = document.getElementById('gridPageTitle');
    elements.movieGrid = document.getElementById('movieGrid');
    elements.gridLoader = document.getElementById('gridLoader');
    elements.gridNoResults = document.getElementById('gridNoResults');
    elements.gridPagination = document.getElementById('gridPagination');
    elements.gridPrevPage = document.getElementById('gridPrevPage');
    elements.gridNextPage = document.getElementById('gridNextPage');
    elements.gridPageInfo = document.getElementById('gridPageInfo');

    elements.toggleFilterBtn = document.getElementById('toggleFilterBtn');
    elements.filterPanel = document.getElementById('filterPanel');
    elements.filterGenre = document.getElementById('filterGenre');
    elements.filterCountry = document.getElementById('filterCountry');
    elements.filterYear = document.getElementById('filterYear');
    elements.filterSort = document.getElementById('filterSort');
    elements.applyFiltersBtn = document.getElementById('applyFiltersBtn');
    elements.resetFiltersBtn = document.getElementById('resetFiltersBtn');
    elements.activeFilterChips = document.getElementById('activeFilterChips');

    elements.watchlistGrid = document.getElementById('watchlistGrid');
    elements.watchlistEmpty = document.getElementById('watchlistEmpty');
    elements.historyList = document.getElementById('historyList');
    elements.historyEmpty = document.getElementById('historyEmpty');
    elements.watchlistPanel = document.getElementById('watchlistPanel');
    elements.historyPanel = document.getElementById('historyPanel');
    elements.countWatchlist = document.getElementById('countWatchlist');
    elements.countHistory = document.getElementById('countHistory');

    elements.movieModal = document.getElementById('movieModal');
    elements.closeModalBtn = document.getElementById('closeModalBtn');
    elements.modalLoading = document.getElementById('modalLoading');
    elements.modalBody = document.getElementById('modalBody');

    elements.playerModal = document.getElementById('playerModal');
    elements.closePlayerBtn = document.getElementById('closePlayerBtn');
    elements.playerBody = document.getElementById('playerBody');
    elements.bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    elements.quickSearchChips = document.querySelectorAll('.quick-search-chip');

    elements.navMemberBtn = document.getElementById('navMemberBtn');
    elements.memberDropdown = document.getElementById('memberDropdown');
    elements.memberWrapper = document.getElementById('memberWrapper');
    elements.loginModal = document.getElementById('loginModal');
    elements.closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
    elements.loginForm = document.getElementById('loginForm');
    elements.loginUsername = document.getElementById('loginUsername');
    elements.loginPassword = document.getElementById('loginPassword');
    elements.memberBtnTuPhim = document.getElementById('memberBtnTuPhim');
    elements.memberBtnHistory = document.getElementById('memberBtnHistory');
    elements.memberBtnLogout = document.getElementById('memberBtnLogout');
}

function runPageRouting(url) {
    const path = url.pathname;
    const pathName = path.split('/').pop().replace(/\.html$/, '').replace(/\.min$/, '');
    const isGridPage = pathName === 'danh-sach';
    const isDetailPage = pathName === 'phim';
    const isWatchPage = pathName === 'xem-phim';
    const isLibraryPage = pathName === 'tu-phim';

    // Clear auto-play hero carousel interval if not on home page
    const isHomePage = !isGridPage && !isDetailPage && !isWatchPage && !isLibraryPage;
    if (!isHomePage && heroInterval) {
        clearInterval(heroInterval);
        heroInterval = null;
    }

    const highlightNav = (linkEl) => {
        setNavigationHighlight(linkEl);
    };

    if (isGridPage) {
        const urlParams = url.searchParams;
        const type = urlParams.get('type') || 'phim-moi-cap-nhat';
        const keyword = urlParams.get('keyword') || '';
        const page = parseInt(urlParams.get('page')) || 1;
        
        if (type === 'phim-bo') highlightNav(elements.navPhimBo);
        else if (type === 'phim-le') highlightNav(elements.navPhimLe);
        else if (type === 'phim-chieu-rap') highlightNav(elements.navPhimChieuRap);
        else if (type === 'phim-moi-cap-nhat') highlightNav(elements.navPhimMoi);
        else if (type === 'the-loai') highlightNav(elements.navTheLoai);
        else if (type === 'quoc-gia') highlightNav(elements.navQuocGia);
        else highlightNav(null);

        return Promise.allSettled([
            loadFiltersData(),
            loadGrid(type, keyword, page)
        ]);
    } else if (isDetailPage) {
        const urlParams = url.searchParams;
        const slug = urlParams.get('slug');
        highlightNav(null);
        if (slug) {
            return fetchMovieDetailsPage(slug);
        } else {
            showToast('Không tìm thấy thông tin phim!', 'error');
            setTimeout(() => navigateToPage('index.html'), 2000);
        }
    } else if (isWatchPage) {
        const urlParams = url.searchParams;
        const slug = urlParams.get('slug');
        const epIndex = parseInt(urlParams.get('ep')) || 0;
        const svIndex = parseInt(urlParams.get('sv')) || 0;
        highlightNav(null);
        if (slug) {
            return playMovieFromSlugPage(slug, epIndex, svIndex);
        } else {
            showToast('Không tìm thấy thông tin phim!', 'error');
            setTimeout(() => navigateToPage('index.html'), 2000);
        }
    } else if (isLibraryPage) {
        highlightNav(elements.navTuPhim);
        loadLibraryPage();
        return Promise.resolve();
    } else {
        highlightNav(elements.navTrangChu);
        initCategoryDeck();
        return loadHomePage();
    }
}
