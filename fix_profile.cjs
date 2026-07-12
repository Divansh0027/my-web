const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');

content = content.replace(
  /export const updateUserProfileDetails = async \([\s\S]*?return false\n    \}\n  \}\n  return false\n\}/,
  `export const updateUserProfileDetails = async (
  uid: string,
  data: Partial<ClientUser>,
): Promise<boolean> => {
  if (data.displayName) data.displayName = sanitizeText(data.displayName)
  if (data.phoneNumber) data.phoneNumber = sanitizeText(data.phoneNumber)
  
  if (authInstance?.currentUser) {
    try {
      if (data.displayName) {
        await updateProfile(authInstance.currentUser, { displayName: data.displayName })
      }
      const docRef = doc(dbInstance as Firestore, 'users', authInstance.currentUser.uid)
      await setDoc(
        docRef,
        {
          uid: authInstance.currentUser.uid,
          ...data,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )
      return true
    } catch (_err: any) {
      return false
    }
  }
  return false
}`
);

fs.writeFileSync('src/firebase.ts', content);
console.log("Fixed updateUserProfileDetails");
