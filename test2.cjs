const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      search(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const inputRegex = /<(input|textarea|select)[^>]*>/gi;
      let match;
      while ((match = inputRegex.exec(content)) !== null) {
        const attributes = match[0];
        if (!attributes.includes('id=') && !attributes.includes('aria-label') && !attributes.includes('title')) {
          console.log("Missing label in:", fullPath);
          console.log("Attributes:", attributes.substring(0, 100));
        }
      }
    }
  }
}
search('src');
