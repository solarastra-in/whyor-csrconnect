import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInAsDemo = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('User closed the sign-in popup.');
      return null;
    }
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
