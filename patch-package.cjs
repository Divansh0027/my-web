const fs = require('fs');
let code = fs.readFileSync('package.json', 'utf8');

code = code.replace(/"build": "vite build && tsx scripts\/generate-sitemap\.ts"/, '"build": "vite build"');
code = code.replace(/"generate-sitemap": "tsx scripts\/generate-sitemap\.ts"/, '');

fs.writeFileSync('package.json', code);
