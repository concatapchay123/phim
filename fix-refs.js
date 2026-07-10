const fs = require('fs');
const path = require('path');

const files = ['index.min.html', 'danh-sach.min.html', 'phim.min.html', 'xem-phim.min.html', 'tu-phim.min.html', 'security-locked.min.html'];
const appVersion = '1.0.18';
const styleVersion = '1.0.12';

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
    
    // Convert links to clean URLs for production Vercel deployment
    content = content.replace(/index\.html/g, '/');
    content = content.replace(/danh-sach\.html/g, 'danh-sach');
    content = content.replace(/phim\.html/g, 'phim');
    content = content.replace(/xem-phim\.html/g, 'xem-phim');
    content = content.replace(/tu-phim\.html/g, 'tu-phim');

    fs.writeFileSync(htmlFile, content, 'utf-8');
    console.log(`References updated successfully for ${file}!`);
});
