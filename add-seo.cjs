const fs = require('fs');
let code = fs.readFileSync('src/features/properties/ListingsView.tsx', 'utf8');

const target = "return (\n    <div className=\"font-sans text-on-surface bg-surface min-h-screen pt-4\">";
const replacement = "return (\n    <>\n      <SEO title=\"Properties for Sale in Noida - Shiv Saya\" description=\"Browse premium verified listings for flats, villas, plots in Noida and Ghaziabad.\" />\n      <div className=\"font-sans text-on-surface bg-surface min-h-screen pt-4\">";

if (code.includes(target)) {
    code = code.replace(target, replacement);
    code = code.replace(/    <\/div>\n  \)\n}\n?$/, "    </div>\n    </>\n  )\n}\n");
    fs.writeFileSync('src/features/properties/ListingsView.tsx', code);
    console.log("Success");
} else {
    console.log("Target not found");
}
