import fs from 'fs';

let content = fs.readFileSync('src/data/sampleData.ts', 'utf8');

// prop-1 Dwarka
content = content.replace(/city: "Dwarka",/, 'city: "Delhi",');
// prop-2 Pitampura
content = content.replace(/city: "Pitampura",/, 'city: "Delhi",');
// prop-7 Aerocity
content = content.replace(/city: "Aerocity",/, 'city: "Delhi",');
// prop-8 Rohini
content = content.replace(/city: "Rohini",/, 'city: "Delhi",');

// COVERED_AREAS
content = content.replace(/export const COVERED_AREAS = \[[\s\S]*?\];/, `export const COVERED_AREAS = [
  "Delhi",
  "Gurugram",
  "Noida",
  "Greater Noida West",
  "Faridabad",
  "Ghaziabad"
];`);

// SD-3: postedBy is "Agent" (but maybe narrative says "direct owner", we can change to Owner)
// Wait, the prompt says "Fix: Ensure sample data matches the business narrative, or update the narrative to be accurate."
// The prompt also says "The marketing copy emphasizes 'direct owner listings', but the sample data has multiple properties posted by 'Agent' and 'Builder'."
// So I will just change all `postedBy` to `"Owner"` in sampleData.ts.
content = content.replace(/postedBy: "Agent"/g, 'postedBy: "Owner"');
content = content.replace(/postedBy: "Builder"/g, 'postedBy: "Owner"');

fs.writeFileSync('src/data/sampleData.ts', content);
