const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

// The prompt specifies: allow write: if request.auth != null && request.auth.token.admin == true
// I'll add this to the catch-all or global level.

// Let's replace the default deny with a new rule.
const replacement = `    // Global Safety Net (default-deny catch-all)
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }`;

code = code.replace(/    \/\/ Global Safety Net \(default-deny catch-all\)[\s\S]*?allow read, write: if false;\n    \}/, replacement);

fs.writeFileSync('firestore.rules', code);
