const fs = require('fs');
let text = fs.readFileSync('package.json', 'utf8');
text = text.replace(/,\s*\}/g, '}'); // Quick fix for trailing commas in objects
try {
  const obj = JSON.parse(text);
  fs.writeFileSync('package.json', JSON.stringify(obj, null, 2));
} catch(e) {
  console.log("Still failed to parse");
  
  // just remove the comma directly
  text = text.replace(/"seed-admin": "tsx scripts\/dev\/seed-admins\.ts",/, '"seed-admin": "tsx scripts/dev/seed-admins.ts"');
  fs.writeFileSync('package.json', text);
}
