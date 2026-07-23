const test = require('node:test');
const assert = require('node:assert/strict');
const {
    buildProviderUrl,
    decodeMovieId,
    encodeMovieId,
    fetchUnified,
    imageUrlFor
} = require('../api/_providers');
const { pickEpisodeSource, renderPlayerHtml, resolveEpisodeSource } = require('../api/_security');

const expectedPaths = {
    a: '/v1/api/home',
    b: '/v1/api/danh-sach/phim-bo',
    c: '/v1/api/danh-sach/phim-le',
    d: '/v1/api/danh-sach/phim-chieu-rap',
    e: '/v1/api/tim-kiem',
    f: '/v1/api/phim/test-film',
    g: '/v1/api/phim/test-film/images',
    h: '/v1/api/the-loai/test-film',
    i: '/v1/api/quoc-gia/test-film',
    j: '/v1/api/the-loai',
    k: '/v1/api/quoc-gia',
    l: '/nam-phat-hanh',
    m: '/v1/api/phim/test-film/peoples',
    n: '/v1/api/phim/test-film/keywords'
};

test('every public kind maps to a documented KKPhim endpoint', () => {
    Object.entries(expectedPaths).forEach(([kind, expectedPath]) => {
        const url = buildProviderUrl('kkphim', kind, { slug: 'test-film', page: 2, limit: 64 });
        assert.equal(url.origin, 'https://phimapi.com');
        assert.equal(url.pathname, expectedPath);
        if (!['j', 'k', 'l'].includes(kind)) assert.equal(url.searchParams.get('page'), '2');
    });
});

test('movie ids are opaque and legacy IDs remain readable', () => {
    const id = encodeMovieId([
        { provider: 'kkphim', slug: 'test-film' },
        { provider: 'other-provider', slug: 'unused-film' }
    ]);
    assert.match(id, /^q1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    assert.equal(id.includes('kkphim'), false);
    assert.equal(id.includes('test-film'), false);
    assert.deepEqual(decodeMovieId(id), [{ provider: 'kkphim', slug: 'test-film' }]);

    const legacyId = Buffer.from(JSON.stringify([
        { p: 'retired-provider', s: 'old-film' },
        { p: 'kkphim', s: 'test-film' }
    ])).toString('base64url');
    assert.deepEqual(decodeMovieId(legacyId), [{ provider: 'kkphim', slug: 'test-film' }]);
});

test('relative KKPhim posters use the KKPhim image CDN', () => {
    assert.equal(
        imageUrlFor('kkphim', 'uploads/movies/20260709/test-film-poster.webp'),
        'https://phimimg.com/uploads/movies/20260709/test-film-poster.webp'
    );
});

test('catalogue and detail responses are normalised from KKPhim only', async () => {
    const calledUrls = [];
    const movie = {
        slug: 'test-film', name: 'Test film', origin_name: 'Test Film', year: 2026, type: 'single',
        poster_url: 'uploads/movies/test-poster.webp', thumb_url: 'uploads/movies/test-thumb.webp', episodes: []
    };
    const fetchMock = async url => {
        calledUrls.push(String(url));
        const pathname = new URL(String(url)).pathname;
        const payload = pathname.endsWith('/images')
            ? { success: true, data: { images: [] } }
            : pathname.endsWith('/peoples')
                ? { success: true, data: { peoples: [] } }
                : pathname.endsWith('/keywords')
                    ? { success: true, data: { keywords: [] } }
                    : pathname.includes('/phim/test-film')
                        ? { status: 'success', data: { item: movie } }
                        : { status: 'success', data: { items: [movie], params: { pagination: { currentPage: 1, totalPages: 1, totalItems: 1, totalItemsPerPage: 24 } } } };
        return { ok: true, json: async () => payload };
    };

    const list = await fetchUnified(fetchMock, 'e', { keyword: 'test', limit: 10 });
    assert.equal(list.data.items[0].poster_url, 'https://phimimg.com/uploads/movies/test-poster.webp');
    assert.match(list.data.items[0].movie_id, /^q1\./);
    assert.equal('provider' in list.data.items[0], false);
    assert.equal('source_refs' in list.data.items[0], false);
    assert.equal('provider_status' in list.data, false);

    for (const kind of ['f', 'g', 'm', 'n']) {
        const response = await fetchUnified(fetchMock, kind, { slug: 'test-film' });
        assert.equal(response.status, 'success');
        assert.equal('provider' in response.data, false);
    }
    assert.ok(calledUrls.length > 0);
    assert.ok(calledUrls.every(url => new URL(url).origin === 'https://phimapi.com'));
});

test('the player resolves exactly the KKPhim episode and reports unavailable content safely', async () => {
    const calls = [];
    const fetchPlayable = async url => {
        calls.push(String(url));
        return {
            ok: true,
            json: async () => ({
                status: 'success',
                data: { item: {
                    slug: 'test-film', name: 'Test film', episodes: [{ server_name: 'Vietsub', server_data: [
                        { name: 'Episode 1', link_m3u8: 'https://stream.example.test/test.m3u8' }
                    ] }]
                } }
            })
        };
    };
    const source = await resolveEpisodeSource(fetchPlayable, { slug: 'test-film', episodeIndex: 0, serverIndex: 0 });
    assert.equal(source.url, 'https://stream.example.test/test.m3u8');
    assert.equal(source.provider, 'kkphim');
    assert.ok(calls.every(url => new URL(url).origin === 'https://phimapi.com'));

    await assert.rejects(
        resolveEpisodeSource(async () => ({ ok: true, json: async () => ({ status: 'success', data: { item: { slug: 'empty-film', episodes: [] } } }) }), {
            slug: 'empty-film', episodeIndex: 0, serverIndex: 0
        }),
        { statusCode: 404 }
    );
});

test('an external embed-only episode is rejected when secure embed fallback is disabled', async () => {
    const fetchEmbedOnly = async () => ({
        ok: true,
        json: async () => ({
            status: 'success',
            data: { item: {
                slug: 'embed-only-film', name: 'Embed only', episodes: [{ server_name: 'Vietsub', server_data: [
                    { name: 'Episode 1', link_embed: 'https://player.example.test/embed/1' }
                ] }]
            } }
        })
    });

    await assert.rejects(
        resolveEpisodeSource(fetchEmbedOnly, { slug: 'embed-only-film', episodeIndex: 0, serverIndex: 0 }),
        { statusCode: 404 }
    );
});

test('player HTML never renders an external iframe when fallback is disabled', () => {
    const html = renderPlayerHtml({
        url: 'https://player.example.test/embed/1', type: 'embed', movieName: 'Embed only', episodeName: 'Episode 1'
    }, 'embed-only-film', 0, 0, 'opaque-id');

    assert.doesNotMatch(html, /player\.example\.test/);
    assert.doesNotMatch(html, /allowfullscreen|allow-presentation/);
});

test('the player prefers a matching dubbed or voice-over server when none is selected', async () => {
    const movie = {
        slug: 'dubbed-film', name: 'Dubbed film', lang: 'Vietsub + Lồng Tiếng', lang_key: ['vs', 'lt'],
        episodes: [
            { server_name: 'Vietsub', server_data: [{ name: 'Full', link_m3u8: 'https://stream.example.test/sub.m3u8' }] },
            { server_name: 'Lồng Tiếng', server_data: [{ name: 'Full', link_m3u8: 'https://stream.example.test/dub.m3u8' }] }
        ]
    };
    const fetchMock = async () => ({ ok: true, json: async () => ({ status: 'success', data: { item: movie } }) });

    const automatic = await resolveEpisodeSource(fetchMock, { slug: 'dubbed-film', episodeIndex: 0 });
    assert.equal(automatic.serverIndex, 1);
    assert.equal(automatic.url, 'https://stream.example.test/dub.m3u8');

    const explicitSubtitle = await resolveEpisodeSource(fetchMock, { slug: 'dubbed-film', episodeIndex: 0, serverIndex: 0 });
    assert.equal(explicitSubtitle.serverIndex, 0);
    assert.equal(explicitSubtitle.url, 'https://stream.example.test/sub.m3u8');
});

test('episode selection stays exact when a strict match is requested', () => {
    const episodes = [{ server_name: 'Vietsub', server_data: [
        { name: 'Episode 25', link_m3u8: 'https://example.test/25.m3u8' },
        { name: '26', link_m3u8: 'https://example.test/26.m3u8' }
    ] }];
    const mapped = pickEpisodeSource(episodes, 25, 0, 'kkphim', { name: 'Episode 26' }, { strictEpisodeMatch: true });
    assert.equal(mapped.episodeName, '26');
    assert.equal(pickEpisodeSource(episodes, 25, 0, 'kkphim', { name: 'Episode 99' }, { strictEpisodeMatch: true }), null);
});

test('player HTML preserves progress but has no provider retry path', () => {
    const html = renderPlayerHtml({
        url: 'https://example.test/master.m3u8', type: 'hls-direct', movieName: 'Test movie', episodeName: 'Episode 1'
    }, 'test-film', 0, 0, 'canonical-movie-id');
    assert.match(html, /var movieKey = "canonical-movie-id"/);
    assert.match(html, /watchProgress_' \+ movieKey/);
    assert.doesNotMatch(html, /retry=1/);
});
