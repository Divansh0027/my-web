import fs from 'fs';

const files = [
  'src/components/ListPropertyView.tsx',
  'src/components/DetailView.tsx',
  'src/components/SavedView.tsx',
  'src/components/ProfileView.tsx',
  'src/components/Navbar.tsx',
  'src/App.tsx'
];
for(const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/import\(\"..\/firebase\"\).ClientUser/g, 'ClientUser');
  content = content.replace(/import\(\".\/firebase\"\).ClientUser/g, 'ClientUser');
  
  if (f === 'src/App.tsx') {
    if (!content.includes('import { ClientUser } from "./firebase";') && !content.includes('import { type ClientUser }')) {
      content = 'import { ClientUser } from "./firebase";\n' + content;
    }
  } else {
    if (!content.includes('import { ClientUser } from "../firebase";') && !content.includes('import { type ClientUser }')) {
      content = 'import { ClientUser } from "../firebase";\n' + content;
    }
  }
  fs.writeFileSync(f, content);
}
console.log('done');
