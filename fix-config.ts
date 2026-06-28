import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/App.tsx',
  'src/components/Footer.tsx',
  'src/components/SavedView.tsx',
  'src/components/AdminView.tsx',
  'src/components/DetailView.tsx',
  'src/components/LoginModal.tsx',
  'src/components/ListingsView.tsx',
  'src/components/ListPropertyView.tsx',
  'src/components/ProfileView.tsx',
  'src/components/Navbar.tsx',
  'src/components/HomeView.tsx'
];

for (const file of filesToUpdate) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace import
  if (file === 'src/App.tsx') {
    content = content.replace(/import \{ BUSINESS_CONFIG \} from "\.\/config";\n/, 'import { useConfig } from "./context/ConfigContext";\n');
  } else {
    content = content.replace(/import \{ BUSINESS_CONFIG \} from "\.\.\/config";\n/, 'import { useConfig } from "../context/ConfigContext";\n');
  }

  // Insert useConfig hook at the top of the main component function
  // We'll look for "export default function ComponentName" or "export default React.memo(function ComponentName"
  const funcRegex = /(export default (?:React\.memo\()?function\s+\w+\s*\([^)]*\)\s*\{)/;
  
  if (funcRegex.test(content)) {
    content = content.replace(funcRegex, `$1\n  const BUSINESS_CONFIG = useConfig();`);
  } else {
    // For App.tsx which might be "export default function App() {" or similar
    const appRegex = /(export default function\s+\w+\s*\([^)]*\)\s*\{)/;
    if (appRegex.test(content)) {
       content = content.replace(appRegex, `$1\n  const BUSINESS_CONFIG = useConfig();`);
    } else {
       console.log("Could not find function signature for", file);
    }
  }

  fs.writeFileSync(file, content);
}

// For ErrorBoundary.tsx, it's a class component. We can't use hooks. Let's just leave it importing from ../config.

console.log("Done");
