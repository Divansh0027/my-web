const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts.build = "vite build && tsx scripts/generate-sitemap.ts";
pkg.scripts['generate-sitemap'] = "tsx scripts/generate-sitemap.ts";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
