const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = file => fs.readFileSync(path.join(root, file));
const hash = file => crypto.createHash('sha256').update(read(file)).digest('hex').slice(0, 16);

const versions = {
    app: hash('app.min.js'),
    style: hash('style.min.css'),
    icons: hash('assets/icons.min.js')
};
const template = read('service-worker.template.js').toString('utf8');
const cacheVersion = crypto.createHash('sha256')
    .update(template)
    .update(JSON.stringify(versions))
    .digest('hex')
    .slice(0, 16);
const shell = [
    `/app.min.js?v=${versions.app}`,
    `/style.min.css?v=${versions.style}`,
    `/assets/icons.min.js?v=${versions.icons}`,
    '/assets/logo.png',
    '/assets/logo-loading.png'
];

const output = template
    .replace('__QC_CACHE_VERSION__', cacheVersion)
    .replace('__QC_APP_SHELL__', JSON.stringify(shell, null, 2));

fs.writeFileSync(path.join(root, 'sw.js'), output, 'utf8');
console.log(`Service worker built: ${cacheVersion}`);
