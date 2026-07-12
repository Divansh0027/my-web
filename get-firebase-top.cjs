const fs = require('fs');
const code = fs.readFileSync('src/firebase.ts', 'utf8');
console.log(code.split('\n').slice(0, 40).join('\n'));
