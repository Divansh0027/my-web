const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const iosMeta = `
    <!-- iOS PWA -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Shiv Saya" />
`;

code = code.replace(/<meta name="theme-color" content="#0F172A" \/>/, `<meta name="theme-color" content="#0F172A" />${iosMeta}`);

fs.writeFileSync('index.html', code);
