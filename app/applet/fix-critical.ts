import fs from 'fs';
import path from 'path';

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(/\|\|\s*currentUser\.email\.toLowerCase\(\)\s*===\s*"divansh0027@gmail\.com"/, '');
appContent = appContent.replace(/<AdminView\s+currentView=\{currentView\}\s+onNavigate=\{handleNavigation\}\s+properties=\{properties\}\s+\/>/, '<AdminView\n              currentView={currentView}\n              onNavigate={handleNavigation}\n              properties={properties}\n              currentUser={currentUser}\n              isAdmin={isAdmin}\n            />');
fs.writeFileSync('src/App.tsx', appContent);

let indexContent = fs.readFileSync('index.html', 'utf-8');
indexContent = indexContent.replace(/img-src 'self' https:\/\/images\.unsplash\.com https:\/\/\*\.googleusercontent\.com data: blob:;/, "img-src 'self' https://images.unsplash.com https://*.googleusercontent.com https://firebasestorage.googleapis.com https://lh3.googleusercontent.com data: blob:;");
indexContent = indexContent.replace(/<meta property="og:image" content="https:\/\/images\.unsplash\.com\/photo-[^"]+" \/>/g, '<meta property="og:image" content="/og-image.jpg" />');
indexContent = indexContent.replace(/<meta name="twitter:image" content="https:\/\/images\.unsplash\.com\/photo-[^"]+" \/>/g, '<meta name="twitter:image" content="/og-image.jpg" />');
fs.writeFileSync('index.html', indexContent);

let mainContent = fs.readFileSync('src/main.tsx', 'utf-8');
mainContent = mainContent.replace(/dsn: "https:\/\/examplePublicKey@o0\.ingest\.sentry\.io\/0",/g, 'dsn: import.meta.env.VITE_SENTRY_DSN || "",\n  enabled: !!import.meta.env.VITE_SENTRY_DSN,');
mainContent = mainContent.replace(/Sentry\.replayIntegration\(\),/g, '...(import.meta.env.VITE_SENTRY_DSN ? [Sentry.replayIntegration()] : []),');
mainContent = mainContent.replace(/replaysSessionSampleRate: 0\.1,/g, 'replaysSessionSampleRate: import.meta.env.VITE_SENTRY_DSN ? 0.1 : 0,');
mainContent = mainContent.replace(/replaysOnErrorSampleRate: 1\.0,/g, 'replaysOnErrorSampleRate: import.meta.env.VITE_SENTRY_DSN ? 1.0 : 0,');
fs.writeFileSync('src/main.tsx', mainContent);

console.log("Fixes applied successfully.");
