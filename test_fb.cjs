const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');

const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  try {
    const q = collection(db, 'payments');
    await getDocs(q);
    console.log("Payments read OK");
  } catch(e) {
    console.log("Payments read error:", e.message);
  }
  try {
    const q2 = collection(db, 'commitments');
    await getDocs(q2);
    console.log("Commitments read OK");
  } catch(e) {
    console.log("Commitments read error:", e.message);
  }
  process.exit(0);
}
run();
