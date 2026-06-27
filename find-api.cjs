const fs = require('fs');

['public/script.js', 'public/account.js'].forEach(file => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
        if (line.includes('/api/listings')) {
            console.log(`${file}:${i + 1}: ${line.trim()}`);
        }
    });
});
