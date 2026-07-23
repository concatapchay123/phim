const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const files = ['index.min.html', 'danh-sach.min.html', 'phim.min.html', 'xem-phim.min.html', 'tu-phim.min.html', 'security-locked.min.html'];

function contentVersion(filename) {
    const contents = fs.readFileSync(path.join(__dirname, filename));
    return crypto.createHash('sha256').update(contents).digest('hex').slice(0, 16);
}

// The files are served with a one-year immutable cache header.  The content
// hash in the query string keeps that cache efficient while making every new
// build visible immediately when an asset changes.
const appVersion = contentVersion('app.min.js');
const styleVersion = contentVersion('style.min.css');
const iconVersion = contentVersion('assets/icons.min.js');

files.forEach(file => {
    const htmlFile = path.join(__dirname, file);
    if (!fs.existsSync(htmlFile)) {
        console.log(`File not found: ${file}`);
        return;
    }
    
    let content = fs.readFileSync(htmlFile, 'utf-8');

    // Replace references to use minified versions
    content = content.replace(/"style(?:\.min)?\.css(?:\?v=[^"]*)?"/g, `"style.min.css?v=${styleVersion}"`);
    content = content.replace(/'style(?:\.min)?\.css(?:\?v=[^']*)?'/g, `'style.min.css?v=${styleVersion}'`);
    content = content.replace(/"app(?:\.min)?\.js(?:\?v=[^"]*)?"/g, `"app.min.js?v=${appVersion}"`);
    content = content.replace(/'app(?:\.min)?\.js(?:\?v=[^']*)?'/g, `'app.min.js?v=${appVersion}'`);
    content = content.replace(/"assets\/icons(?:\.min)?\.js(?:\?v=[^"]*)?"/g, `"assets/icons.min.js?v=${iconVersion}"`);
    content = content.replace(/'assets\/icons(?:\.min)?\.js(?:\?v=[^']*)?'/g, `'assets/icons.min.js?v=${iconVersion}'`);
    
    // Convert links to clean URLs for production Vercel deployment
    content = content.replace(/index\.html/g, '/');
    content = content.replace(/danh-sach\.html/g, 'danh-sach');
    content = content.replace(/phim\.html/g, 'phim');
    content = content.replace(/xem-phim\.html/g, 'xem-phim');
    content = content.replace(/tu-phim\.html/g, 'tu-phim');

    fs.writeFileSync(htmlFile, content, 'utf-8');
    console.log(`References updated successfully for ${file}!`);
});
