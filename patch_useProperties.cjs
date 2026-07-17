const fs = require('fs');
let content = fs.readFileSync('src/features/properties/useProperties.ts', 'utf8');

content = content.replace(/old: any/g, 'old: any'); // let's leave old: any alone if it works, or we can use unknown
content = content.replace(/page: any/g, "page: { data: Property[], nextCursor?: unknown }");
content = content.replace(/p: any/g, "p: Property");

fs.writeFileSync('src/features/properties/useProperties.ts', content);
