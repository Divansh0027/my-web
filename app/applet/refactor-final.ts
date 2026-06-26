import fs from 'fs';

let content = fs.readFileSync('./src/components/Navbar.tsx', 'utf8');

// Replace the <nav> wrapper
content = content.replace(
  /<nav\s+id="main-navbar"\s+className=\{`absolute top-0 left-0 right-0 z-50 transition-all duration-300 font-sans \$\{[\s\S]*?\}`\}\s*>\s*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\s*<div className="flex items-center justify-between">/,
  `<nav
      id="main-navbar"
      className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans px-4 \$\{
        isScrolled ? "pt-4" : "pt-6"
      }\`}
    >
      <div className={\`mx-auto max-w-7xl transition-all duration-300 \$\{
        isScrolled 
          ? "bg-surface/85 backdrop-blur-xl border border-outline-variant/50 shadow-sm rounded-2xl px-6 py-3" 
          : "bg-transparent px-2 py-0"
      }\`}>
        <div className="flex items-center justify-between">`
);

// Close the extra div
content = content.replace(
  /<\/div>\s*<\/div>\s*<\/nav>/,
  `        </div>
      </div>
    </nav>`
);

fs.writeFileSync('./src/components/Navbar.tsx', content);

let homeContent = fs.readFileSync('./src/components/HomeView.tsx', 'utf8');

// Refine secondary button (WhatsApp)
homeContent = homeContent.replace(
  /className="w-full sm:w-auto px-7 py-3 rounded-full bg-success-green\/10 hover:bg-success-green\/20 border border-success-green\/20 text-success-green font-bold text-sm flex items-center justify-center gap-2 transition-all"/,
  'className="w-full sm:w-auto px-7 py-3 rounded-full bg-surface hover:bg-success-green/5 border border-success-green text-success-green font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"'
);

// Reduce hero white overlay
homeContent = homeContent.replace(
  /<div className="absolute inset-0 bg-surface\/90 backdrop-blur-\[2px\]"><\/div>/,
  '<div className="absolute inset-0 bg-surface/75 backdrop-blur-[2px]"></div>'
);

// Reduce search overall height by approx 8-10%, reduce padding, reduce button width
homeContent = homeContent.replace(
  /className="w-full max-w-5xl mt-12 bg-surface-container\/80 backdrop-blur-xl border border-outline-variant p-6 rounded-2xl md:rounded-\[32px\] shadow-sm flex flex-col md:flex-row items-center gap-6 text-left"/,
  'className="w-full max-w-5xl mt-12 bg-surface-container/80 backdrop-blur-xl border border-outline-variant p-4 md:p-5 rounded-2xl md:rounded-[28px] shadow-sm flex flex-col md:flex-row items-center gap-4 text-left"'
);

// Reduce search button height and width
homeContent = homeContent.replace(
  /className="w-full md:w-auto h-12 md:h-14 px-8 rounded-full bg-gold-accent hover:bg-gold-hover hover:scale-105 text-\[#0F172A\] font-bold flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer transition-all"/,
  'className="w-full md:w-auto h-12 md:h-12 px-6 rounded-full bg-gold-accent hover:bg-gold-hover hover:scale-105 text-[#0F172A] font-bold flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer transition-all"'
);

// Increase line-height for paragraphs
homeContent = homeContent.replace(
  /leading-relaxed"/g,
  'leading-loose"'
);

homeContent = homeContent.replace(
  /className="text-on-surface-variant text-base mt-6 max-w-xl"/g,
  'className="text-on-surface-variant text-base mt-6 max-w-xl leading-loose"'
);

homeContent = homeContent.replace(
  /className="text-on-surface-variant text-base max-w-2xl mx-auto mt-6"/g,
  'className="text-on-surface-variant text-base max-w-2xl mx-auto mt-6 leading-loose"'
);


fs.writeFileSync('./src/components/HomeView.tsx', homeContent);

console.log('UI Polish Applied');
