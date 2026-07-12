const fs = require('fs');
let code = fs.readFileSync('src/features/properties/ListingsView.tsx', 'utf8');

const returnMatch = code.match(/return \(\s*<div/);
if (returnMatch) {
    code = code.replace(
        /return \(\s*<div/,
        `return (\n    <>\n      <SEO title="Properties for Sale in Noida - Shiv Saya" description="Browse premium verified listings for flats, villas, plots in Noida and Ghaziabad." />\n      <div`
    );
    code = code.replace(/    <\/div>\n  \)\n}\n?$/, `    </div>\n    </>\n  )\n}\n`);
    fs.writeFileSync('src/features/properties/ListingsView.tsx', code);
    console.log("Replaced successfully");
} else {
    console.log("No return match found");
}
