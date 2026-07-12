const fs = require('fs');
let content = fs.readFileSync('src/features/properties/DetailView.tsx', 'utf8');

content = content.replace(
  /<span\s+className="hover:text-on-surface-variant cursor-pointer"\s+onClick=\{[^}]+\}\s*>\s*Home\s*<\/button>/g,
  `<button\n              className="hover:text-on-surface-variant cursor-pointer focus:outline-none"\n              onClick={() => navigate('/')}\n            >\n              Home\n            </button>`
);

content = content.replace(
  /<span\s+className="hover:text-on-surface-variant cursor-pointer"\s+onClick=\{[^}]+\}\s*>\s*Properties\s*<\/button>/g,
  `<button\n              className="hover:text-on-surface-variant cursor-pointer focus:outline-none"\n              onClick={() => navigate('/properties')}\n            >\n              Properties\n            </button>`
);

fs.writeFileSync('src/features/properties/DetailView.tsx', content);
