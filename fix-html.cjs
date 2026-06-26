const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const agricultureDir = path.join(publicDir, 'agriculture');

const filesToUpdate = [
    path.join(publicDir, 'index.html'),
    path.join(publicDir, 'vehicles.html'),
    path.join(publicDir, 'machinery.html'),
    path.join(publicDir, 'spares.html'),
    path.join(publicDir, 'services.html'),
    path.join(agricultureDir, 'equipments.html'),
    path.join(agricultureDir, 'livestock.html'),
    path.join(agricultureDir, 'produce.html')
];

for (const file of filesToUpdate) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // 1. Update MY ACCOUNT link
        content = content.replace(/<a href="login\.html" id="account-nav-link">MY ACCOUNT<\/a>/g, '<a href="login.html?redirect=account.html" id="account-nav-link">MY ACCOUNT</a>');
        content = content.replace(/<a href="\.\.\/login\.html" id="account-nav-link">MY ACCOUNT<\/a>/g, '<a href="../login.html?redirect=account.html" id="account-nav-link">MY ACCOUNT</a>');
        
        // 2. Update POST AD link
        content = content.replace(/<a href="login\.html" id="post-ad-nav-link" class="post-ad-btn">POST FREE AD<\/a>/g, '<a href="login.html?redirect=post-ad.html" id="post-ad-nav-link" class="post-ad-btn">POST FREE AD</a>');
        content = content.replace(/<a href="\.\.\/login\.html" id="post-ad-nav-link" class="post-ad-btn">POST FREE AD<\/a>/g, '<a href="../login.html?redirect=post-ad.html" id="post-ad-nav-link" class="post-ad-btn">POST FREE AD</a>');

        fs.writeFileSync(file, content);
        console.log(`Updated redirect links in ${file}`);
    }
}

// 3. Update auto-redirect in login.html to respect ?redirect=
const loginFile = path.join(publicDir, 'login.html');
if (fs.existsSync(loginFile)) {
    let loginContent = fs.readFileSync(loginFile, 'utf8');
    
    // Find the old auto-redirect block and replace it
    const oldLoginProtectScript = `<script>
    // If user is ALREADY logged in, skip login and go to dashboard
    const token = localStorage.getItem('zaa_token');
    if (token) {
        window.location.href = 'account.html';
    }
</script>
</head>`;

    const newLoginProtectScript = `<script>
    // If user is ALREADY logged in, respect redirect param or go to dashboard
    const token = localStorage.getItem('zaa_token');
    if (token) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'account.html';
        window.location.href = redirect;
    }
</script>
</head>`;
    
    if (loginContent.includes('window.location.href = \'account.html\';')) {
        loginContent = loginContent.replace(oldLoginProtectScript, newLoginProtectScript);
        fs.writeFileSync(loginFile, loginContent);
        console.log('Updated auto-redirect in login.html');
    }
}
