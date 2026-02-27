import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyBJieZhszVNBByPbLKdPQju5jfP_YJmlgs",
  authDomain: "curso-adveasy.firebaseapp.com",
  databaseURL: "https://curso-adveasy-default-rtdb.firebaseio.com",
  projectId: "curso-adveasy",
  storageBucket: "curso-adveasy.appspot.com",
  messagingSenderId: "713967456585",
  appId: "1:713967456585:web:b199a115626abec5de0a98",
  measurementId: "G-KZ53X6X5MY"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);

export const getStorageInstance = () => {
  try {
    return getStorage(app);
  } catch (error) {
    console.error("Firebase Storage not available:", error);
    return null;
  }
};

export const storage = getStorageInstance();
export default app;
