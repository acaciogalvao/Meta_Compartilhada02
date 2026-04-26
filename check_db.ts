import admin from "firebase-admin";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

// Initialize without cert if we are just using the default credentials in the environment
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function check() {
  try {
    const doc = await db.collection('settings').doc('config').get();
    console.log("Settings config:", doc.data());
  } catch (e) {
    console.error(e);
  }
}
check();
