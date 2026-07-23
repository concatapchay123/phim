const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

function loadLibraryHelpers() {
    const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
    const start = source.indexOf('function normaliseLibraryIdentityText');
    const end = source.indexOf('const libraryManager', start);
    assert.ok(start >= 0 && end > start, 'library helpers must be present in app.js');

    const context = {};
    vm.runInNewContext(source.slice(start, end), context);
    return context;
}

test('history keeps only the newest entry for a stable library id', () => {
    const { dedupeLibraryEntries } = loadLibraryHelpers();
    const entries = dedupeLibraryEntries([
        { movie_id: 'q1.old-token', library_id: 'ql1.same-film', name: 'Film', watchedAt: 100, episodeName: 'Tập 1' },
        { movie_id: 'q1.new-token', library_id: 'ql1.same-film', name: 'Film', watchedAt: 200, episodeName: 'Tập 2' }
    ], 'watchedAt');

    assert.equal(entries.length, 1);
    assert.equal(entries[0].movie_id, 'q1.new-token');
    assert.equal(entries[0].episodeName, 'Tập 2');
});

test('legacy history duplicates are merged by title, original title, and year', () => {
    const { dedupeLibraryEntries } = loadLibraryHelpers();
    const entries = dedupeLibraryEntries([
        { movie_id: 'q1.older', name: 'Bách Hoa Sát', origin_name: 'The Killing Flower', year: 2026, watchedAt: 100, episodeName: 'Tập 1' },
        { movie_id: 'q1.newer', name: 'Bách Hoa Sát', origin_name: 'The Killing Flower', year: 2026, watchedAt: 200, episodeName: 'Tập 3' },
        { movie_id: 'q1.other', name: 'Bách Hoa Sát', origin_name: 'A Different Film', year: 2026, watchedAt: 300, episodeName: 'Tập 1' }
    ], 'watchedAt');

    assert.equal(entries.length, 2);
    assert.equal(entries[0].movie_id, 'q1.other');
    assert.equal(entries[1].movie_id, 'q1.newer');
    assert.equal(entries[1].episodeName, 'Tập 3');
});
