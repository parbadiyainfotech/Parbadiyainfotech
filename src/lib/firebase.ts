import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "artful-inn-spsvl",
  appId: "1:705935700037:web:f69d2c269e728a3f6eb32c",
  apiKey: "AIzaSyCoD7nKvtgwmmDmLtviplH5XJWL92aQcd4",
  authDomain: "artful-inn-spsvl.firebaseapp.com",
  storageBucket: "artful-inn-spsvl.firebasestorage.app",
  messagingSenderId: "705935700037"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
