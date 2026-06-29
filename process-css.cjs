const fs = require('fs');
const path = require('path');

const srcPath = path.join('C:', 'Users', 'conil', 'OneDrive', 'Desktop', 'my-website', 'public', 'admin.css');
const destPath = path.join(__dirname, 'frontend', 'src', 'assets', 'css', 'admin.css');

let content = fs.readFileSync(srcPath, 'utf8');

// Scope body
content = content.replace(/^body \{/m, '.admin-wrapper {');
// Scope *
content = content.replace(/^\* \{/m, '.admin-wrapper * {');
// Provide background to .admin-wrapper
content = content.replace(/\.admin-wrapper \{([\s\S]*?)min-height: 100vh;/, '.admin-wrapper {$1min-height: 100vh; width: 100%;');

fs.writeFileSync(destPath, content, 'utf8');
console.log('Done!');
