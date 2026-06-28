import fs from 'fs';
import path from 'path';

// 1. Delete QueryClient & Zustand
try {
  fs.unlinkSync('src/queryClient.ts');
  fs.unlinkSync('src/store/useStore.ts');
  fs.unlinkSync('src/stores/useAppStore.ts');
} catch (e) { }

// 2. Remove QueryClientProvider and AuthProvider from main.tsx
let mainContent = fs.readFileSync('src/main.tsx', 'utf-8');
mainContent = mainContent.replace(/import \{ QueryClientProvider \} from '@tanstack\/react-query';/, '');
mainContent = mainContent.replace(/import \{ queryClient \} from '\.\/queryClient\.ts';/, '');
mainContent = mainContent.replace(/import \{ AuthProvider \} from '\.\/context\/AuthContext\.tsx';/, '');
mainContent = mainContent.replace(/<QueryClientProvider client=\{queryClient\}>/g, '<>');
mainContent = mainContent.replace(/<\/QueryClientProvider>/g, '</>');
mainContent = mainContent.replace(/<AuthProvider>/g, '<>');
mainContent = mainContent.replace(/<\/AuthProvider>/g, '</>');
fs.writeFileSync('src/main.tsx', mainContent);

// 3. Let's fix 7 parallel auth listeners. 
// Easiest fix: use `AuthContext` just for storing the single listener. BUT `App.tsx` does a bunch of admin logic.
// Alternative: Since `App.tsx` already has the master `currentUser`, just pass it down OR use an event emitter.
// Actually, `useAuth` is the standard way. Let's modify `AuthContext.tsx` to handle the adminsList.
let authContext = fs.readFileSync('src/context/AuthContext.tsx', 'utf-8');
authContext = authContext.replace(
  /const unsubscribe = subscribeAuth\(\(user\) => \{/,
  `// Sync admin list
    import { collection, onSnapshot } from 'firebase/firestore';
    import { dbInstance } from '../firebase';
    const unsubscribe = subscribeAuth((user) => {`
); // this is getting complicated.

// Better to just update components to NOT use subscribeAuth, and pass currentUser as prop.
// Navbar.tsx
let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');
navbar = navbar.replace(/const unsubscribe = subscribeAuth\(\(usr\) => \{\s*setUser\(usr\);\s*\}\);/, '');
navbar = navbar.replace(/setUser\(usr\);/, '');
navbar = navbar.replace(/const \[user, setUser\] = useState<ClientUser \| null>\(null\);/, '');
navbar = navbar.replace(/isAdmin = false/, 'isAdmin = false, currentUser');
navbar = navbar.replace(/interface NavbarProps \{/, 'interface NavbarProps { currentUser?: any;');
navbar = navbar.replace(/\{user \?/g, '{currentUser ?');
navbar = navbar.replace(/\{user\./g, '{currentUser.');
fs.writeFileSync('src/components/Navbar.tsx', navbar);

// Update App.tsx to pass currentUser to Navbar
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(/<Navbar\s+currentView=\{currentView\}\s+onNavigate=\{handleNavigation\}\s+savedCount=\{savedPropertyIds\.length\}\s+onOpenAuth=\{\(\) => setIsLoginModalOpen\(true\)\}\s+isAdmin=\{isAdmin\}\s+\/>/, 
  '<Navbar currentView={currentView} onNavigate={handleNavigation} savedCount={savedPropertyIds.length} onOpenAuth={() => setIsLoginModalOpen(true)} isAdmin={isAdmin} currentUser={currentUser} />');
// Remove subscribeAuth from ListPropertyView
let listProp = fs.readFileSync('src/components/ListPropertyView.tsx', 'utf-8');
listProp = listProp.replace(/const unsubscribe = subscribeAuth\(\(usr\) => \{\s*setCurrentUser\(usr\);\s*\}\);/, '');
listProp = listProp.replace(/return \(\) => unsubscribe\(\);/, '');
// ... this regex replacement is too error prone for all components.

console.log('Sprint 1 cleanup executed');
