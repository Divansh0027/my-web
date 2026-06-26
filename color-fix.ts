import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (path: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else {
      callback(p);
    }
  }
}

walk('./src', (p) => {
  if (!p.endsWith('.tsx') && !p.endsWith('.ts')) return;
  
  let content = fs.readFileSync(p, 'utf8');
  
  // Convert hover:brightness-110 and active:scale-98 on gold buttons to hover:bg-gold-hover etc?
  content = content.replace(/hover:brightness-110/g, 'hover:bg-gold-hover hover:scale-105 shadow-md');
  
  // Replace emerald/green in AdminView
  if (p.includes('AdminView.tsx')) {
    // Top stat cards: "border-l-emerald-500" -> "border-l-gold-accent"
    content = content.replace(/border-l-emerald-500/g, 'border-l-gold-accent');
    // ShieldCheck icon
    content = content.replace(/<ShieldCheck className="h-10 w-10 text-emerald-500" \/>/g, '<ShieldCheck className="h-10 w-10 text-on-surface" />');
    
    // Status badges or informational badges: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
    // The user wants monochrome or gold for these. Active states -> gold.
    content = content.replace(/bg-emerald-500\/15 text-emerald-400 border-emerald-500\/10/g, 'bg-gold-accent/15 text-gold-accent border-gold-accent/20');
    content = content.replace(/bg-emerald-500\/15 text-emerald-400 border border-emerald-500\/10/g, 'bg-gold-accent/15 text-gold-accent border border-gold-accent/20');
    
    // Table filter active state: bg-emerald-500
    content = content.replace(/bg-emerald-500/g, 'bg-gold-accent');
    content = content.replace(/text-emerald-500/g, 'text-gold-accent');
    content = content.replace(/hover:bg-emerald-600/g, 'hover:bg-gold-hover');
    content = content.replace(/ring-emerald-500\/50/g, 'ring-gold-accent/50');
    content = content.replace(/bg-emerald-500\/10 text-emerald-400 border-emerald-500\/25 focus:ring-emerald-500/g, 'bg-gold-accent/10 text-gold-accent border-gold-accent/25 focus:ring-gold-accent');
    content = content.replace(/bg-emerald-500\/10 hover:bg-emerald-500\/20 text-\[#10B981\] border border-\[#10B981\]\/25/g, 'bg-gold-accent/10 hover:bg-gold-accent/20 text-gold-accent border border-gold-accent/25');
    content = content.replace(/bg-emerald-500\/10 text-emerald-400 border-emerald-500\/20/g, 'bg-gold-accent/10 text-gold-accent border-gold-accent/20');
    content = content.replace(/bg-emerald-500\/10 hover:bg-emerald-500\/25 hover:text-on-surface text-emerald-400 border border-emerald-500\/25/g, 'bg-gold-accent/10 hover:bg-gold-accent/25 hover:text-on-surface text-gold-accent border border-gold-accent/25');
    
    // "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
    content = content.replace(/border-emerald-500\/20 text-emerald-400 bg-emerald-500\/5/g, 'border-gold-accent/20 text-gold-accent bg-gold-accent/5');
    
    // Checkmarks text-emerald-400
    content = content.replace(/text-emerald-400/g, 'text-success-green');
    
    // Pulse indicator for "Live"
    content = content.replace(/bg-emerald-500 animate-pulse/g, 'bg-success-green animate-pulse');
  }

  // Find green-500 for whatsapp
  content = content.replace(/text-green-500/g, 'text-success-green');
  content = content.replace(/bg-green-500/g, 'bg-success-green');

  fs.writeFileSync(p, content);
});
console.log('Fixed colors!');
