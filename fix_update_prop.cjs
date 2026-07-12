const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');

content = content.replace(
  /export const updatePropertyInDb = async \([\s\S]*?return false\n  \}\n\}/,
  `export const updatePropertyInDb = async (
  propertyId: string,
  updates: Partial<Property>,
): Promise<boolean> => {
  if (updates.title) updates.title = sanitizeText(updates.title)
  if (updates.description) updates.description = sanitizeText(updates.description)
  if (updates.location) updates.location = sanitizeText(updates.location)
  if (updates.city) updates.city = sanitizeText(updates.city) as City
  if (updates.type) updates.type = sanitizeText(updates.type)
  if (updates.category) updates.category = sanitizeText(updates.category)

  try {
    const docRef = doc(dbInstance as Firestore, 'properties', propertyId)
    await setDoc(docRef, cleanForFirestore(updates), { merge: true })
    return true
  } catch (error: any) {
    console.error('updatePropertyInDb failed:', error)
    return false
  }
}`
);

fs.writeFileSync('src/firebase.ts', content);
