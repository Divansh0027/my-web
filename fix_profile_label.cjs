const fs = require('fs');
let content = fs.readFileSync('src/features/auth/ProfileView.tsx', 'utf8');

// The issue is around line 712.
content = content.replace(
  '<label\n                  htmlFor="auto-profileview-584"\n                  className="relative inline-flex items-center cursor-pointer"\n                >',
  '<label\n                  htmlFor="auto-profileview-584"\n                  className="relative inline-flex items-center cursor-pointer"\n                  aria-label="Toggle animations"\n                >'
);
fs.writeFileSync('src/features/auth/ProfileView.tsx', content);
