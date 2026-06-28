import fs from 'fs';

let adminViewContent = fs.readFileSync('src/components/AdminView.tsx', 'utf-8');
adminViewContent = adminViewContent.replace(/interface AdminViewProps \{/, 'interface AdminViewProps {\n  currentUser?: any;\n  isAdmin?: boolean;');
adminViewContent = adminViewContent.replace(/onShowNotification: \(msg: string, type: "success" \| "info"\) => void;/, 'onShowNotification: (msg: string, type: "success" | "info" | "error") => void;');
adminViewContent = adminViewContent.replace(/@gmail\.com/g, '@example.com');
fs.writeFileSync('src/components/AdminView.tsx', adminViewContent);

let errorBoundaryContent = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf-8');
errorBoundaryContent = errorBoundaryContent.replace(/shivsayaproperties@gmail\.com/g, 'info@shivsayaproperties.com');
fs.writeFileSync('src/components/ErrorBoundary.tsx', errorBoundaryContent);

let typesContent = fs.readFileSync('src/types.ts', 'utf-8');
typesContent = typesContent.replace(/export interface Enquiry \{([\s\S]*?)\}/, `export interface Enquiry {$1\n  email?: string;\n  propertyLocation?: string;\n  visitDate?: string;\n  status?: "New" | "Contacted" | "Resolved";\n  source?: string;\n  createdAt?: string;\n}`);
fs.writeFileSync('src/types.ts', typesContent);

let firebaseContent = fs.readFileSync('src/firebase.ts', 'utf-8');
firebaseContent = firebaseContent.replace(/details\?: any/g, 'details?: Record<string, string | number | boolean | null>');
firebaseContent = firebaseContent.replace(/throw new Error\(\`Production Build\/Deployment Error:[\s\S]*?\`\);/, 'if (import.meta.env.PROD) { throw new Error(`Production: Missing Firebase env vars: ${missingKeys.join(", ")}`); } else { console.error(`[Dev] Missing Firebase env vars: ${missingKeys.join(", ")}`); console.error("App will run in offline/guest mode."); }');
fs.writeFileSync('src/firebase.ts', firebaseContent);

console.log("Fixes sprint 1 applied");
