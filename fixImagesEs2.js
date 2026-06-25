import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // First, undo my bad previous replace: `/ loading="lazy">` back to `/>`
  // Wait, the previous script did: return `<img${p1} loading="lazy">`;
  // So `<img src="..." />` became `<img src="..." / loading="lazy">`
  content = content.replace(/\/ loading="lazy">/g, 'loading="lazy" />');

  // Second, remove duplicate loading="lazy" if we accidentally added them
  content = content.replace(/loading="lazy"\s*loading="lazy"/g, 'loading="lazy"');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
}

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));
files.forEach(processFile);
