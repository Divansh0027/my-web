import fs from 'fs';
import path from 'path';

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      let content = fs.readFileSync(p, 'utf8');
      const original = content;

      if (p.includes('types.ts')) {
          content = content.replace(/status\?: ModerationStatus;/, 'moderationStatus?: ModerationStatus;');
          content = content.replace(/listingStatus\?: AvailabilityStatus;/, 'availabilityStatus?: AvailabilityStatus;');
      } else {
          // Careful replacements
          content = content.replace(/\.listingStatus/g, '.availabilityStatus');
          content = content.replace(/listingStatus:/g, 'availabilityStatus:');
          
          // Replace property.status / prop.status / p.status / matched.status / updated.status / newProp.status / completedProp.status / found.status
          const propertyRefs = ['property', 'prop', 'p', 'matched', 'updated', 'newProp', 'completedProp', 'found'];
          for (const ref of propertyRefs) {
              content = content.replace(new RegExp(`\\b${ref}\\.status\\b`, 'g'), `${ref}.moderationStatus`);
          }
          
          content = content.replace(/status: "live"/g, 'moderationStatus: "live"');
          content = content.replace(/status: controls\.autoApproveListings \? "live" : "pending"/g, 'moderationStatus: controls.autoApproveListings ? "live" : "pending"');
          content = content.replace(/status: "pending"/g, 'moderationStatus: "pending"');
          content = content.replace(/status: "rejected"/g, 'moderationStatus: "rejected"');
          content = content.replace(/status: nextStatus/g, 'moderationStatus: nextStatus');
          content = content.replace(/status: options\.forceStatus/g, 'moderationStatus: options.forceStatus');
      }

      if (content !== original) {
          fs.writeFileSync(p, content);
      }
    }
  });
}
walk('./src');
