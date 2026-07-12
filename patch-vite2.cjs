const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(/theme_color: '#0F172A',/, `theme_color: '#0F172A',\n          background_color: '#0F172A',\n          display: 'standalone',\n          start_url: '/',`);

fs.writeFileSync('vite.config.ts', code);
