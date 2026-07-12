const fs = require('fs');
let code = fs.readFileSync('src/features/properties/ListingsView.tsx', 'utf8');
code = code.replace(
  /return \(\n\s*<div/,
  `return (\n    <>\n      <SEO title="Properties for Sale in Noida - Shiv Saya" description="Browse premium verified listings for flats, villas, plots in Noida and Ghaziabad." />\n      <div`
);
code = code.replace(
  /        \)\n      }\n    <\/div>\n  \)\n}\n/g,
  `        )\n      }\n    </div>\n    </>\n  )\n}\n`
);

fs.writeFileSync('src/features/properties/ListingsView.tsx', code);
