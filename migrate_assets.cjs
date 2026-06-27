const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const frontendPublicDir = path.join(__dirname, 'frontend', 'public');
const frontendCssDir = path.join(__dirname, 'frontend', 'src', 'assets', 'css');

// Ensure target directories exist
if (!fs.existsSync(frontendPublicDir)) {
    fs.mkdirSync(frontendPublicDir, { recursive: true });
}
if (!fs.existsSync(frontendCssDir)) {
    fs.mkdirSync(frontendCssDir, { recursive: true });
}

// Read all files in public
const files = fs.readdirSync(publicDir);

files.forEach(file => {
    const fullPath = path.join(publicDir, file);
    if (fs.statSync(fullPath).isFile()) {
        const ext = path.extname(file).toLowerCase();
        
        if (ext === '.css') {
            fs.copyFileSync(fullPath, path.join(frontendCssDir, file));
            console.log(`Copied CSS: ${file}`);
        } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4'].includes(ext)) {
            // Keep images in public so they are served at root e.g. /hilux.jpg
            fs.copyFileSync(fullPath, path.join(frontendPublicDir, file));
            console.log(`Copied Asset: ${file}`);
        }
    }
});

console.log('Migration of Assets & CSS complete.');
