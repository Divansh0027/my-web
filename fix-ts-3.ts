import fs from 'fs';

// SavedView.tsx
let savedStr = fs.readFileSync('src/components/SavedView.tsx', 'utf8');
savedStr = savedStr.replace(/import \{ Heart, MapPin, BedDouble, Trash2, ArrowRight \} from "lucide-react";\n/, 'import { Heart, MapPin, BedDouble, Maximize, Trash2, ArrowRight } from "lucide-react";\n');
fs.writeFileSync('src/components/SavedView.tsx', savedStr);

console.log("Done");
