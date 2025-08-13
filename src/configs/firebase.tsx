import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCQlczzqpx9P7rNE_T8PDbg54k1mSwpOhc",
    authDomain: "fy-form-acm.firebaseapp.com",
    projectId: "fy-form-acm",
    storageBucket: "fy-form-acm.firebasestorage.app",
    messagingSenderId: "317471656724",
    appId: "1:317471656724:web:00def56b5529155ac19001",
    measurementId: "G-PBNYL2WST1"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app); 