import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAfuj9DnhQQ-d5vQbRl2TDIK-z3Ykm2Smo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "life-admin-ai-b35c1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "life-admin-ai-b35c1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "life-admin-ai-b35c1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "805154362764",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:805154362764:web:5c66a8439bc8b4ac6172a9"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
};
export type { FirebaseUser };
