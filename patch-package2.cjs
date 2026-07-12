const fs = require('fs');
let code = fs.readFileSync('package.json', 'utf8');

code = code.replace(/"seed-admin": "tsx scripts\/dev\/seed-admins\.ts",\n      }/, '"seed-admin": "tsx scripts/dev/seed-admins.ts"\n  }');

fs.writeFileSync('package.json', code);
