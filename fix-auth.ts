import fs from 'fs';
import path from 'path';

// Clean App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf-8');
// Replace state vars with useAuth
app = app.replace(/const \[currentUser, setCurrentUser\] = useState<ClientUser \| null>\(null\);/, 'const { currentUser, isAdmin } = useAuth();');
app = app.replace(/const \[adminsList, setAdminsList\] = useState<string\[\]>\(\[\]\);/, '');
app = app.replace(/\/\/ Synchronize admin status reactively[\s\S]*?\}, \[currentUser, adminsList\]\);/, '');

// Remove subscribeAuth from useEffect
app = app.replace(/const unsubAuth = subscribeAuth\(\(user\) => \{\s*setCurrentUser\(user\);\s*\}\);/, '');
app = app.replace(/return \(\) => \{\s*unsubAuth\(\);\s*unsubProps\(\);\s*unsubAdmin\(\);\s*unsubSettings\(\);\s*\};/, 'return () => {\n      unsubProps();\n      unsubAdmin();\n      unsubSettings();\n    };');

// Remove admin list sync from App.tsx useEffect since it's now in AuthContext
app = app.replace(/const unsubAdmin = onSnapshot\(collection\(dbInstance, 'admin_emails'\), \(snapshot\) => \{[\s\S]*?setAdminsList\(ADMIN_EMAILS\);\s*\}\);/, 'const unsubAdmin = () => {};');

// Import useAuth
if (!app.includes('useAuth')) {
  app = app.replace(/import \{ subscribeAuth, ClientUser/g, "import { useAuth } from './context/AuthContext';\nimport { subscribeAuth, ClientUser");
}
fs.writeFileSync('src/App.tsx', app);


// Navbar.tsx
let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');
navbar = navbar.replace(/const \[user, setUser\] = useState<ClientUser \| null>\(null\);/, 'const { currentUser: user } = useAuth();');
navbar = navbar.replace(/const unsubscribe = subscribeAuth\(\(usr\) => \{\s*setUser\(usr\);\s*\}\);/, '');
if (!navbar.includes('useAuth')) {
  navbar = navbar.replace(/import \{ subscribeAuth, ClientUser \} from "\.\.\/firebase";/, 'import { subscribeAuth, ClientUser } from "../firebase";\nimport { useAuth } from "../context/AuthContext";');
}
fs.writeFileSync('src/components/Navbar.tsx', navbar);


// DetailView.tsx
let detail = fs.readFileSync('src/components/DetailView.tsx', 'utf-8');
detail = detail.replace(/const \[currentUser, setCurrentUser\] = useState<ClientUser \| null>\(null\);/, 'const { currentUser } = useAuth();');
detail = detail.replace(/const unsubAuth = subscribeAuth\(\(user\) => \{\s*setCurrentUser\(user\);\s*\}\);/, '');
detail = detail.replace(/unsubAuth\(\);/, '');
if (!detail.includes('useAuth')) {
  detail = detail.replace(/import \{ subscribeAuth, ClientUser \} from "\.\.\/firebase";/, 'import { subscribeAuth, ClientUser } from "../firebase";\nimport { useAuth } from "../context/AuthContext";');
}
fs.writeFileSync('src/components/DetailView.tsx', detail);


// ListPropertyView.tsx
let listprop = fs.readFileSync('src/components/ListPropertyView.tsx', 'utf-8');
listprop = listprop.replace(/const \[currentUser, setCurrentUser\] = useState<ClientUser \| null>\(null\);/, 'const { currentUser } = useAuth();');
listprop = listprop.replace(/const unsubscribe = subscribeAuth\(\(usr\) => \{\s*setCurrentUser\(usr\);\s*\}\);/, '');
if (!listprop.includes('useAuth')) {
  listprop = listprop.replace(/import \{ subscribeAuth, ClientUser \} from "\.\.\/firebase";/, 'import { subscribeAuth, ClientUser } from "../firebase";\nimport { useAuth } from "../context/AuthContext";');
}
fs.writeFileSync('src/components/ListPropertyView.tsx', listprop);


// ProfileView.tsx
let profile = fs.readFileSync('src/components/ProfileView.tsx', 'utf-8');
profile = profile.replace(/const \[currentUser, setCurrentUser\] = useState<ClientUser \| null>\(null\);/, 'const { currentUser } = useAuth();');
profile = profile.replace(/const unsubscribe = subscribeAuth\(\(user\) => \{\s*setCurrentUser\(user\);\s*\}\);/, '');
if (!profile.includes('useAuth')) {
  profile = profile.replace(/import \{ subscribeAuth, ClientUser \} from "\.\.\/firebase";/, 'import { subscribeAuth, ClientUser } from "../firebase";\nimport { useAuth } from "../context/AuthContext";');
}
fs.writeFileSync('src/components/ProfileView.tsx', profile);


// SavedView.tsx
let saved = fs.readFileSync('src/components/SavedView.tsx', 'utf-8');
saved = saved.replace(/const \[currentUser, setCurrentUser\] = useState<ClientUser \| null>\(null\);/, 'const { currentUser } = useAuth();');
saved = saved.replace(/const unsubscribe = subscribeAuth\(\(user\) => \{\s*setCurrentUser\(user\);\s*\}\);/, '');
if (!saved.includes('useAuth')) {
  saved = saved.replace(/import \{ subscribeAuth, ClientUser \} from "\.\.\/firebase";/, 'import { subscribeAuth, ClientUser } from "../firebase";\nimport { useAuth } from "../context/AuthContext";');
}
fs.writeFileSync('src/components/SavedView.tsx', saved);

console.log("Refactored auth");
