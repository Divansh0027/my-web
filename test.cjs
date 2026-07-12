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
      const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
      let match;
      while ((match = buttonRegex.exec(content)) !== null) {
        const attributes = match[0].replace(match[1], '');
        const inner = match[1].replace(/<[^>]*>/g, '').trim();
        if (!attributes.includes('aria-label') && !attributes.includes('title') && !attributes.includes('aria-labelledby') && inner.length === 0) {
          console.log("Empty button in:", fullPath);
          console.log("Attributes:", attributes.substring(0, 100));
        }
      }
      
      const aRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi;
      let amatch;
      while ((amatch = aRegex.exec(content)) !== null) {
        const attributes = amatch[0].replace(amatch[1], '');
        const inner = amatch[1].replace(/<[^>]*>/g, '').trim();
        if (!attributes.includes('aria-label') && !attributes.includes('title') && !attributes.includes('aria-labelledby') && inner.length === 0) {
          console.log("Empty a tag in:", fullPath);
          console.log("Attributes:", attributes.substring(0, 100));
        }
      }
    }
  }
}
search('src');
