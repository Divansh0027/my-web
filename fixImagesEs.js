import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const initial = content;

  // We find <img ... > that don't have loading="lazy" and add it.
  content = content.replace(/<img([^>]*)>/g, (match, p1) => {
    if (!p1.includes('loading=')) {
      return `<img${p1} loading="lazy">`;
    }
    return match;
  });

  if (content !== initial) {
    fs.writeFileSync(filePath, content);
  }
}

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));
files.forEach(processFile);
