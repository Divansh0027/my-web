import fs from 'fs';

let content = fs.readFileSync('./src/components/HomeView.tsx', 'utf8');

// 1. Improve Hero Hierarchy & Spacing
// Between Hero Heading and Description: 40-48px -> mt-12 (48px)
content = content.replace(/className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mt-5 leading-relaxed"/, 'className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mt-12 leading-relaxed"');

// Between Description and CTA: 32px -> mt-8 (32px, already there)
// Between CTA and Search: 48px -> mt-12 (48px, already there)
// Between Search and Statistics: 56px -> mt-14 (56px)
content = content.replace(/className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 bg-surface-container\/40 border border-outline-variant\/50 py-6 px-10 rounded-2xl"/, 'className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-14 bg-surface-container/40 border border-outline-variant/50 py-6 px-10 rounded-2xl"');

// Section paddings: py-24 (96px) -> py-32 (128px)
content = content.replace(/py-24/g, 'py-32');

// 2. Refine Search Bar
// "Increase internal padding, field height slightly, more spacing between filters"
content = content.replace(/className="w-full max-w-5xl mt-12 bg-surface-container\/80 backdrop-blur-xl border border-outline-variant p-5 rounded-2xl md:rounded-full shadow-md flex flex-col md:flex-row items-center gap-4 text-left"/, 'className="w-full max-w-5xl mt-12 bg-surface-container/80 backdrop-blur-xl border border-outline-variant p-6 rounded-2xl md:rounded-[32px] shadow-sm flex flex-col md:flex-row items-center gap-6 text-left"');
// Increase field height slightly: h-6 -> h-8
content = content.replace(/pl-6 h-6/g, 'pl-6 h-8');

// 3. Improve Card Design
// "Softer shadows, slightly larger border radius, more internal padding"
content = content.replace(/className="bg-surface-container border border-outline-variant\/50 rounded-2xl overflow-hidden shadow group flex flex-col justify-between"/g, 'className="bg-surface-container border border-outline-variant/50 rounded-3xl overflow-hidden shadow-sm group flex flex-col justify-between"');
// subtle hover animation
content = content.replace(/whileHover=\{\{ y: -8 \}\}/g, 'whileHover={{ y: -4 }}');

fs.writeFileSync('./src/components/HomeView.tsx', content);

console.log('Fixed HomeView UI rules!');
