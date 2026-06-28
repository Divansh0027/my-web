import fs from 'fs';
import path from 'path';

// 1. Create vercel.json
fs.writeFileSync('vercel.json', JSON.stringify({
  rewrites: [
    { source: "/(.*)", destination: "/index.html" }
  ],
  headers: [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
      ]
    }
  ]
}, null, 2));

// 2. Remove hardcoded email in App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(/\|\|\s*currentUser\.email\.toLowerCase\(\)\s*===\s*"divansh0027@gmail\.com"/, '');

// 4. Update CSP in index.html
let indexContent = fs.readFileSync('index.html', 'utf-8');
indexContent = indexContent.replace(/img-src 'self' https:\/\/images\.unsplash\.com https:\/\/\*\.googleusercontent\.com data: blob:;/, "img-src 'self' https://images.unsplash.com https://*.googleusercontent.com https://firebasestorage.googleapis.com https://lh3.googleusercontent.com data: blob:;");
// 4.a Update meta images
indexContent = indexContent.replace(/<meta property="og:image" content="https:\/\/images\.unsplash\.com\/photo-[^"]+" \/>/g, '<meta property="og:image" content="/og-image.jpg" />');
indexContent = indexContent.replace(/<meta name="twitter:image" content="https:\/\/images\.unsplash\.com\/photo-[^"]+" \/>/g, '<meta name="twitter:image" content="/og-image.jpg" />');
fs.writeFileSync('index.html', indexContent);

// 3. Update Sentry initialization in src/main.tsx
let mainContent = fs.readFileSync('src/main.tsx', 'utf-8');
mainContent = mainContent.replace(/dsn: "https:\/\/examplePublicKey@o0\.ingest\.sentry\.io\/0",/g, 'dsn: import.meta.env.VITE_SENTRY_DSN || "",\n  enabled: !!import.meta.env.VITE_SENTRY_DSN,');
mainContent = mainContent.replace(/Sentry\.replayIntegration\(\),/g, '...(import.meta.env.VITE_SENTRY_DSN ? [Sentry.replayIntegration()] : []),');
mainContent = mainContent.replace(/replaysSessionSampleRate: 0\.1,/g, 'replaysSessionSampleRate: import.meta.env.VITE_SENTRY_DSN ? 0.1 : 0,');
mainContent = mainContent.replace(/replaysOnErrorSampleRate: 1\.0,/g, 'replaysOnErrorSampleRate: import.meta.env.VITE_SENTRY_DSN ? 1.0 : 0,');
fs.writeFileSync('src/main.tsx', mainContent);

// 7. Update AdminViewProps in App.tsx & AdminView.tsx
appContent = appContent.replace(/<AdminView\s+currentView=\{currentView\}\s+onNavigate=\{handleNavigation\}\s+properties=\{properties\}\s+\/>/, '<AdminView\n              currentView={currentView}\n              onNavigate={handleNavigation}\n              properties={properties}\n              currentUser={currentUser}\n              isAdmin={isAdmin}\n            />');

// Moderation status casting and getSelectedProperty in App.tsx
appContent = appContent.replace(/moderationStatus: nextStatus as any/g, 'moderationStatus: nextStatus as ModerationStatus');
appContent = appContent.replace(/completedProp\.moderationStatus = options\.forceStatus as any/g, 'completedProp.moderationStatus = options.forceStatus as ModerationStatus');
appContent = appContent.replace(/const getSelectedProperty = \(\): Property \| null => \{[\s\S]*?\};\n\s*const selectedProperty = getSelectedProperty\(\);/, 'const selectedProperty = React.useMemo(() => properties.find(p => p.id === selectedPropertyId) || null, [properties, selectedPropertyId]);');

// BUSINESS_CONFIG any cast
appContent = appContent.replace(/\(BUSINESS_CONFIG as any\)\[key\] = settings\[key\];/, '(BUSINESS_CONFIG as Record<string, string>)[key] = settings[key];');

// Tailwind typos in App.tsx
appContent = appContent.replace(/text-slate-405/g, 'text-slate-400');
appContent = appContent.replace(/animate-spin-slow/g, 'animate-spin');

fs.writeFileSync('src/App.tsx', appContent);

let adminViewContent = fs.readFileSync('src/components/AdminView.tsx', 'utf-8');
adminViewContent = adminViewContent.replace(/interface AdminViewProps \{/, 'interface AdminViewProps {\n  currentUser?: any;\n  isAdmin?: boolean;');
adminViewContent = adminViewContent.replace(/onShowNotification: \(msg: string, type: "success" \| "info"\) => void;/, 'onShowNotification: (msg: string, type: "success" | "info" | "error") => void;');

// Sample emails in AdminView.tsx
adminViewContent = adminViewContent.replace(/@gmail\.com/g, '@example.com');

fs.writeFileSync('src/components/AdminView.tsx', adminViewContent);

// ErrorBoundary email
let errorBoundaryContent = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf-8');
errorBoundaryContent = errorBoundaryContent.replace(/shivsayaproperties@gmail\.com/g, 'info@shivsayaproperties.com');
fs.writeFileSync('src/components/ErrorBoundary.tsx', errorBoundaryContent);

// Types
let typesContent = fs.readFileSync('src/types.ts', 'utf-8');
typesContent = typesContent.replace(/export interface Enquiry \{([\s\S]*?)\}/, `export interface Enquiry {$1\n  email?: string;\n  propertyLocation?: string;\n  visitDate?: string;\n  status?: "New" | "Contacted" | "Resolved";\n  source?: string;\n  createdAt?: string;\n}`);
fs.writeFileSync('src/types.ts', typesContent);

// Firebase logAdminAction
let firebaseContent = fs.readFileSync('src/firebase.ts', 'utf-8');
firebaseContent = firebaseContent.replace(/details\?: any/g, 'details?: Record<string, string | number | boolean | null>');
firebaseContent = firebaseContent.replace(/throw new Error\(\`Production Build\/Deployment Error:[\s\S]*?\`\);/, 'if (import.meta.env.PROD) { throw new Error(`Production: Missing Firebase env vars: ${missingKeys.join(", ")}`); } else { console.error(`[Dev] Missing Firebase env vars: ${missingKeys.join(", ")}`); console.error("App will run in offline/guest mode."); }');
fs.writeFileSync('src/firebase.ts', firebaseContent);

console.log("Applied critical fixes");
