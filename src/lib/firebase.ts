import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCM93pK-Sq_CdN_XaHDhw8Auufuh31Zw8",
  authDomain: "cinematique-6cb7c.firebaseapp.com",
  projectId: "cinematique-6cb7c",
  storageBucket: "cinematique-6cb7c.firebasestorage.app",
  messagingSenderId: "620466736199",
  appId: "1:620466736199:web:4dfbb64a2fb092168bf562",
  measurementId: "G-ZBN7S09Q8Y"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
