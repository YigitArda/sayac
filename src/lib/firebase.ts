import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbxzipIr7OwL9gmCNdVZWng_WPS19c5Jc",
  authDomain: "sayac-3319d.firebaseapp.com",
  projectId: "sayac-3319d",
  storageBucket: "sayac-3319d.firebasestorage.app",
  messagingSenderId: "686074762297",
  appId: "1:686074762297:web:12dc0d5190b76724dca9e8",
  databaseURL: "https://sayac-3319d-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
