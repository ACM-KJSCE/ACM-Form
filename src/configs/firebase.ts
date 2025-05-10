import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCm-Q5wJnaj4-m9ZZ6jzpQAJ_flUFmsJfk",
    authDomain: "acm-form-24dc7.firebaseapp.com",
    projectId: "acm-form-24dc7",
    storageBucket: "acm-form-24dc7.firebasestorage.app",
    messagingSenderId: "918528647383",
    appId: "1:918528647383:web:2064eb9086f25d60915092",
    measurementId: "G-NSBG9W716V"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app); 