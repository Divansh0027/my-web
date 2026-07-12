const fs = require('fs');
let code = fs.readFileSync('src/features/home/HomeView.tsx', 'utf8');
code = code.replace(
  /<Helmet>[\s\S]*?<\/Helmet>/,
  `<SEO 
        title="Shiv Saya Properties - Premium Real Estate in Noida"
        description="Shiv Saya Properties offers verified real estate listings in Ghaziabad, Noida, Delhi NCR. Buy, sell, or rent flats, villas, plots, and commercial spaces."
      />`
);
fs.writeFileSync('src/features/home/HomeView.tsx', code);
