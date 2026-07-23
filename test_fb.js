import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  try {
    await signInWithEmailAndPassword(auth, 'solarastra.in@gmail.com', 'password123'); // assuming standard password or I'll just check reads without auth
  } catch(e) {
    console.log("Auth failed, testing as guest");
  }
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
