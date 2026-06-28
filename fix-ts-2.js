const fs = require('fs');

// App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf8');
appStr = appStr.replace(/  subscribeAuth,\s*\n/, '');
fs.writeFileSync('src/App.tsx', appStr);

// SavedView.tsx
let savedStr = fs.readFileSync('src/components/SavedView.tsx', 'utf8');
savedStr = savedStr.replace(/import \{ useState, useEffect \} from "react";\n/, '');
fs.writeFileSync('src/components/SavedView.tsx', savedStr);

console.log("Done");
