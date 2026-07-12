const fs = require('fs');
let code = fs.readFileSync('src/sw.ts', 'utf8');

code = code.replace(/precacheAndRoute\(__WB_MANIFEST\)/, "precacheAndRoute(self.__WB_MANIFEST)");

fs.writeFileSync('src/sw.ts', code);
