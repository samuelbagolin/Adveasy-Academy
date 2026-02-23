import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJieZhszVNBByPbLKdPQju5jfP_YJmlgs",
  authDomain: "curso-adveasy.firebaseapp.com",
  databaseURL: "https://curso-adveasy-default-rtdb.firebaseio.com",
  projectId: "curso-adveasy",
  storageBucket: "curso-adveasy.firebasestorage.app",
  messagingSenderId: "713967456585",
  appId: "1:713967456585:web:b199a115626abec5de0a98",
  measurementId: "G-KZ53X6X5MY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export default app;
