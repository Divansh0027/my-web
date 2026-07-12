const fs = require('fs');
let code = fs.readFileSync('src/features/properties/ListingsView.tsx', 'utf8');
code = code.replace(
  "String(prop.bhk || '')",
  "String(prop.bhk || '')).toLowerCase()"
);
code = code.replace(
  "const searchText =",
  "const searchText = ("
);
fs.writeFileSync('src/features/properties/ListingsView.tsx', code);
