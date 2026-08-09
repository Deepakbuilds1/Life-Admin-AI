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
  apiKey: "AIzaSyAfuj9DnhQQ-d5vQbRl2TDIK-z3Ykm2Smo",
  authDomain: "life-admin-ai-b35c1.firebaseapp.com",
  projectId: "life-admin-ai-b35c1",
  storageBucket: "life-admin-ai-b35c1.firebasestorage.app",
  messagingSenderId: "805154362764",
  appId: "1:805154362764:web:5c66a8439bc8b4ac6172a9"
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
