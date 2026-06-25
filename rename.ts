import fs from 'fs';
import path from 'path';

function walk(dir: string) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      let content = fs.readFileSync(p, 'utf8');
      
      // We only want to rename listingStatus -> availabilityStatus
      content = content.replace(/listingStatus/g, 'availabilityStatus');
      content = content.replace(/property\.status/g, 'property.moderationStatus');
      content = content.replace(/prop\.status/g, 'prop.moderationStatus');
      content = content.replace(/p\.status/g, 'p.moderationStatus');
      content = content.replace(/e\.status/g, 'e.status'); // enquiries are untouched ideally, we will see if we can do this without regex collisions
      fs.writeFileSync(p, content);
    }
  });
}
walk('./src');
