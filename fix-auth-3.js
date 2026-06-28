const fs = require('fs');

function removeSubscribeAuthEffect(file) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/useEffect\(\(\) => \{\s*const unsub(scribe)? = subscribeAuth\([\s\S]*?return \(\) => unsub(scribe)?\(\);\s*\}, \[\]\);/, '');
  fs.writeFileSync(file, content);
}

removeSubscribeAuthEffect('src/components/DetailView.tsx');
removeSubscribeAuthEffect('src/components/ListPropertyView.tsx');
removeSubscribeAuthEffect('src/components/SavedView.tsx');

let profile = fs.readFileSync('src/components/ProfileView.tsx', 'utf-8');
profile = profile.replace(/useEffect\(\(\) => \{\s*const unsubscribe = subscribeAuth\([\s\S]*?return \(\) => unsubscribe\(\);\s*\}, \[\]\);/, `useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.displayName || "");
      setEditEmail(currentUser.email || "");
    } else {
      setEditName("");
      setEditEmail("");
    }
  }, [currentUser]);`);
fs.writeFileSync('src/components/ProfileView.tsx', profile);

// Remove user state from ProfileView
profile = fs.readFileSync('src/components/ProfileView.tsx', 'utf-8');
profile = profile.replace(/const \[user, setUser\] = useState<ClientUser \| null>\(null\);/, 'const user = currentUser;');
fs.writeFileSync('src/components/ProfileView.tsx', profile);

// Remove user state from SavedView
let saved = fs.readFileSync('src/components/SavedView.tsx', 'utf-8');
saved = saved.replace(/const \[user, setUser\] = useState<ClientUser \| null>\(null\);/, 'const user = currentUser;');
fs.writeFileSync('src/components/SavedView.tsx', saved);

console.log("Cleanup done");
