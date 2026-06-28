import fs from 'fs';
import path from 'path';

const files = [
  'color-fix.ts',
  'fix-auth-2.ts',
  'fix-auth-3.js',
  'fix-auth-3.ts',
  'fix-auth.ts',
  'fix-config.ts',
  'fix-critical.ts',
  'fix-imports.ts',
  'fix-sprint1.ts',
  'fix-ts-2.js',
  'fix-ts-2.ts',
  'fix-ts-3.ts',
  'fix-ts.js',
  'fix-ts.ts',
  'fixImages.js',
  'fixImagesEs.js',
  'fixImagesEs2.js',
  'fixSampleData.js',
  'refactor-final.ts',
  'refactor-navbar.ts',
  'refactor-ui.ts',
  'refactor.js',
  'rename.ts',
  'rename2.js'
];

if (!fs.existsSync('scripts')) {
  fs.mkdirSync('scripts');
}

for (const file of files) {
  if (fs.existsSync(file)) {
    fs.renameSync(file, path.join('scripts', file));
  }
}

// update .gitignore
let gitignore = fs.readFileSync('.gitignore', 'utf8');
if (!gitignore.includes('scripts/')) {
  fs.appendFileSync('.gitignore', '\n# Temp scripts\nscripts/\n');
}

console.log('Moved files to scripts directory');
