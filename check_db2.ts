import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  try {
    const configDoc = await getDoc(doc(db, 'settings', 'config'));
    console.log("Settings config:", configDoc.data());
  } catch (e) {
    console.error(e);
  }
}
check();
