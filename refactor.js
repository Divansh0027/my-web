const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const filesToUpdate = [];
walk(srcDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    filesToUpdate.push(filePath);
  }
});

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  if (file.endsWith('types.ts')) {
    content = content.replace(/priceString: string; \/\/ e.g. "₹85 Lakhs" or "₹2.8 Crore"\n\s*/, '');
    
    // Fix status and listingStatus
    content = content.replace('status?: "live" | "pending" | "rejected";', 'status?: "live" | "pending" | "rejected";\n  moderationStatus?: "live" | "pending" | "rejected"; // keeping status for backwards compat, add moderationStatus');
    
    // Fix postedBy
    content = content.replace('postedBy: "Owner" | "Builder" | "Agent" | string;', 'postedBy: "Owner" | "Builder" | "Agent";\n  customPostedBy?: string;');
    
    // Fix bhk
    content = content.replace('bhk: number | string | null;', 'bhk: number | null;');
    
    // Fix city
    content = content.replace('city: "Gurugram" | "Noida" | "Greater Noida West" | "South Delhi" | "Dwarka" | "Aerocity" | "Faridabad" | "Rohini" | "Pitampura" | "Vasant Kunj" | "Saket" | string;', 'city: City;');
    content = content.replace('export interface Property {', 'export type City = "Gurugram" | "Noida" | "Greater Noida West" | "South Delhi" | "Dwarka" | "Aerocity" | "Faridabad" | "Rohini" | "Pitampura" | "Vasant Kunj" | "Saket";\n\nexport interface Property {');
  }

  // Replace priceString usage
  if (content.includes('priceString')) {
    // AdminView
    if (file.endsWith('AdminView.tsx')) {
        content = content.replace('priceString: price >= 10000000 ? `₹${(price / 10000000).toFixed(2)} Crore` : `₹${(price / 100000).toFixed(0)} Lakhs`,', '');
    }
    if (file.endsWith('ListPropertyView.tsx')) {
        content = content.replace('priceString: priceStrVal,', '');
    }
    
    content = content.replace(/property\.priceString/g, 'formatPrice(property.price)');
    content = content.replace(/prop\.priceString/g, 'formatPrice(prop.price)');
    content = content.replace(/p\.priceString/g, 'formatPrice(p.price)');
    
    if (content.includes('formatPrice(') && !content.includes('import { formatPrice }')) {
       // add import
       let relativePath = file.split('/').length > 2 ? '../utils/format' : './utils/format';
       if (file.endsWith('App.tsx')) relativePath = './utils/format';
       if (file.includes('components/')) relativePath = '../utils/format';
       
       content = `import { formatPrice } from "${relativePath}";\n` + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
