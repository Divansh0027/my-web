const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(/registerType: 'autoUpdate',/, `strategies: 'injectManifest',\n        srcDir: 'src',\n        filename: 'sw.ts',\n        registerType: 'autoUpdate',`);

fs.writeFileSync('vite.config.ts', code);
