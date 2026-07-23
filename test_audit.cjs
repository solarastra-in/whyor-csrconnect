const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');

const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  try {
    const q = collection(db, 'platform/auditLog/events');
    await getDocs(q);
    console.log("Audit log read OK");
  } catch(e) {
    console.log("Audit log read error:", e.message);
  }
  process.exit(0);
}
run();
