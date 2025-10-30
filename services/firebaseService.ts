import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  Auth,
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { UserData } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyD3TmZbe0iPJz4vu7Iy6lMWRrhTY9iteVs",
  authDomain: "ai-resume-54bb5.firebaseapp.com",
  projectId: "ai-resume-54bb5",
  storageBucket: "ai-resume-54bb5.firebasestorage.app",
  messagingSenderId: "891209132070",
  appId: "1:891209132070:web:cdeab2d34790fefefc5ee7",
  measurementId: "G-ME6MFDTV7E"
};

const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
const db = getFirestore(app);

// --- AUTHENTICATION ---

export const signUpWithEmail = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create an initial document for the new user
    const initialUserData: UserData = {
        userProfile: null,
        recommendations: [],
        learningProgress: {},
        chatHistory: [],
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), initialUserData);
    return userCredential;
};

export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const signOutUser = () => signOut(auth);

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- FIRESTORE DATABASE ---

export const saveUserData = async (userId: string, data: UserData) => {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  try {
    // Using set with merge is safer and can create the doc if it doesn't exist
    await setDoc(userDocRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

export const loadUserData = async (userId: string): Promise<UserData | null> => {
    if (!userId) return null;
    const userDocRef = doc(db, 'users', userId);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserData;
        }
        // If doc doesn't exist for some reason, return null
        return null;
    } catch (error) {
        console.error("Error loading user data:", error);
        return null;
    }
};