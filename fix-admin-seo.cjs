const fs = require('fs');
let code = fs.readFileSync('src/features/admin/AdminView.tsx', 'utf8');

code = code.replace(
  /return \(\s*<div/,
  `return (\n    <>\n      <SEO title="Admin Dashboard | Shiv Saya Properties" noindex={true} />\n      <div`
);
code = code.replace(/    <\/div>\n  \)\n}\n?$/, "    </div>\n    </>\n  )\n}\n");

fs.writeFileSync('src/features/admin/AdminView.tsx', code);
