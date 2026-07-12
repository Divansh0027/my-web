const fs = require('fs');
let code = fs.readFileSync('storage.rules', 'utf8');

if (!code.includes('request.auth.token.admin')) {
  // Add a global safety net or admin check for the bucket just in case
  const globalRule = `
    // Global admin access
    match /{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }`;

  code = code.replace(/match \/b\/\{bucket\}\/o \{/, "match /b/{bucket}/o {" + globalRule);
  fs.writeFileSync('storage.rules', code);
}
