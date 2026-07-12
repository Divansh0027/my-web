const fs = require('fs');
let code = fs.readFileSync('src/features/properties/ListingsView.tsx', 'utf8');

code = code.replace(/<SEO title="Properties for Sale in Noida - Shiv Saya" description="Browse premium verified listings for flats, villas, plots in Noida and Ghaziabad." \/>\)\s*=>/g, ') =>');

code = code.replace(/<SEO title="Properties for Sale in Noida - Shiv Saya" description="Browse premium verified listings for flats, villas, plots in Noida and Ghaziabad." \/>/g, '');

fs.writeFileSync('src/features/properties/ListingsView.tsx', code);
