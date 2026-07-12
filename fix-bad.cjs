const fs = require('fs');
let code = fs.readFileSync('src/features/properties/ListingsView.tsx', 'utf8');

// Undo all <SEO> lines
code = code.replace(/^\s*<SEO title="Properties for Sale in Noida - Shiv Saya".*\n/gm, '');

// Fix returns
code = code.replace(/return \(\n\s*<>\n\s*\) =>/g, "return () =>");
code = code.replace(/return \(\n\s*<>\n\s*/g, "return (\n");

fs.writeFileSync('src/features/properties/ListingsView.tsx', code);
