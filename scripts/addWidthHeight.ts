import * as fs from 'fs';
import * as path from 'path';

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  content = content.replace(/<img(.*?)>/g, (m, p1) => {
    if (!m.includes('width=') && !m.includes('height=')) {
      modified = true;
      return '<img width={800} height={600}' + p1 + '>';
    }
    return m;
  });
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir: string) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) processFile(p);
  });
}

walk('src/components');
console.log('Done');
