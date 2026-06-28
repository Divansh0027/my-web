import fs from 'fs';

// App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf8');
appStr = appStr.replace(/import \{ ClientUser \} from "\.\/firebase";\n/, '');
appStr = appStr.replace(/subscribeAuth,\n\s*/, '');
appStr = appStr.replace(/subscribeRemoteAdmins,\n\s*/, '');
fs.writeFileSync('src/App.tsx', appStr);

// AdminView.tsx
let adminStr = fs.readFileSync('src/components/AdminView.tsx', 'utf8');
adminStr = adminStr.replace(/  currentUser,\n\s*isAdmin,\n\s*/, '');
fs.writeFileSync('src/components/AdminView.tsx', adminStr);

// DetailView.tsx
let detailStr = fs.readFileSync('src/components/DetailView.tsx', 'utf8');
detailStr = detailStr.replace(/import \{ ClientUser \} from "\.\.\/firebase";\n/, '');
detailStr = detailStr.replace(/, subscribeAuth /, ' ');
fs.writeFileSync('src/components/DetailView.tsx', detailStr);

// ListPropertyView.tsx
let listStr = fs.readFileSync('src/components/ListPropertyView.tsx', 'utf8');
listStr = listStr.replace(/import \{ ClientUser \} from "\.\.\/firebase";\n/, '');
listStr = listStr.replace(/subscribeAuth, /, '');
fs.writeFileSync('src/components/ListPropertyView.tsx', listStr);

// Navbar.tsx
let navStr = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navStr = navStr.replace(/import \{ ClientUser \} from "\.\.\/firebase";\n/, '');
navStr = navStr.replace(/, subscribeAuth /, ' ');
fs.writeFileSync('src/components/Navbar.tsx', navStr);

// ProfileView.tsx
let profileStr = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');
profileStr = profileStr.replace(/import \{ ClientUser \} from "\.\.\/firebase";\n/, '');
profileStr = profileStr.replace(/subscribeAuth, /, '');
fs.writeFileSync('src/components/ProfileView.tsx', profileStr);

// SavedView.tsx
let savedStr = fs.readFileSync('src/components/SavedView.tsx', 'utf8');
savedStr = savedStr.replace(/import \{ ClientUser \} from "\.\.\/firebase";\n/, '');
savedStr = savedStr.replace(/import \{ subscribeAuth \} from "\.\.\/firebase";\n/, '');
savedStr = savedStr.replace(/, Maximize/, ''); // just in case it is unused
fs.writeFileSync('src/components/SavedView.tsx', savedStr);

console.log("Done");
