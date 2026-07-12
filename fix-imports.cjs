const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const importRegex = /import\s+.*?from\s+['"][^'"]+['"];?/g;
const newImports = "import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';";

code = code.replace(newImports, '');
code = code.replace("import { initializeApp, getApp, getApps } from 'firebase/app'", "import { initializeApp, getApp, getApps } from 'firebase/app'\n" + newImports);

fs.writeFileSync('src/firebase.ts', code);
