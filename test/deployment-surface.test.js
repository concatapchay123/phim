const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const ignoredFiles = new Set(
    fs.readFileSync(path.join(projectRoot, '.vercelignore'), 'utf8')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
);

test('Vercel deployment excludes unminified source and operational artifacts', () => {
    [
        'app.js',
        'style.css',
        'server.js',
        'HUONG_DAN_API_KKPHIM.md',
        'test',
        '*.map',
        '*.log',
        '*.bat',
        '.env',
        '.env.*'
    ].forEach(entry => assert.ok(ignoredFiles.has(entry), `${entry} must not be deployed`));
});

test('Vercel deployment keeps the browser artifacts needed at runtime', () => {
    ['app.min.js', 'style.min.css', 'index.min.html', 'sw.js'].forEach(file => {
        assert.ok(fs.existsSync(path.join(projectRoot, file)), `${file} must be present for production`);
        assert.ok(!ignoredFiles.has(file), `${file} must not be ignored`);
    });
});

test('service worker is regenerated from source and never browser-cached', () => {
    const build = fs.readFileSync(path.join(projectRoot, 'build.bat'), 'utf8');
    const config = fs.readFileSync(path.join(projectRoot, 'vercel.json'), 'utf8');
    const worker = fs.readFileSync(path.join(projectRoot, 'sw.js'), 'utf8');

    assert.match(build, /build-service-worker\.js/);
    assert.match(config, /"source": "\/sw\.js"/);
    assert.match(config, /"Cache-Control", "value": "no-store, max-age=0"/);
    assert.match(worker, /const MAX_IMAGE_ENTRIES = 200/);
    assert.match(worker, /url\.pathname\.startsWith\('\/api\/'\)/);
    assert.match(worker, /request\.destination === 'video'/);
});

test('asset reference fixer derives cache versions from the built asset contents', () => {
    const fixer = fs.readFileSync(path.join(projectRoot, 'fix-refs.js'), 'utf8');

    assert.match(fixer, /createHash\('sha256'\)/);
    assert.doesNotMatch(fixer, /const appVersion = '\d/);
    assert.doesNotMatch(fixer, /const styleVersion = '\d/);
});
