import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { SAMPLE_PROPERTIES } from "../src/data/sampleData";

import * as fs from "fs";
import * as path from "path";

const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
let firebaseConfigJson = {};
if (fs.existsSync(configPath)) {
  firebaseConfigJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

const app = initializeApp(firebaseConfigJson);
const db = getFirestore(app);

async function seed() {
  console.log("Starting database seed with SAMPLE_PROPERTIES...");
  
  let count = 0;
  for (const property of SAMPLE_PROPERTIES) {
    try {
      const docRef = doc(db, "properties", property.id);
      await setDoc(docRef, property);
      count++;
      console.log(`Seeded property: ${property.id}`);
    } catch (error) {
      console.error(`Failed to seed property ${property.id}:`, error);
    }
  }
  
  console.log(`Successfully seeded ${count} properties!`);
}

seed().catch(console.error);
