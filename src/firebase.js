import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDuTzkhkPEj-aPWvM2z-bSOeDDuW_0Lpdk",
  authDomain: "campusride-33192.firebaseapp.com",
  projectId: "campusride-33192",
  storageBucket: "campusride-33192.firebasestorage.app",
  messagingSenderId: "15297141590",
  appId: "1:15297141590:web:b70e37f116ebcaf43494f7"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // 🔥 THIS WAS MISSING
