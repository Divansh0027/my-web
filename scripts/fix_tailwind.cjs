const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/h-4\.5/g, 'h-4')
    .replace(/w-4\.5/g, 'w-4')
    .replace(/h-5\.5/g, 'h-5')
    .replace(/w-5\.5/g, 'w-5')
    .replace(/scale-101/g, 'scale-[1.01]')
    .replace(/bg-slate-1000/g, 'bg-slate-950')
    .replace(/py-3\.5/g, 'py-3')
    .replace(/p-4\.5/g, 'p-4')
    .replace(/px-4\.5/g, 'px-4')
    .replace(/py-4\.5/g, 'py-4')
    .replace(/px-5\.5/g, 'px-6')
    .replace(/py-5\.5/g, 'py-6');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
});
