import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCm-Q5wJnaj4-m9ZZ6jzpQAJ_flUFmsJfk",
    authDomain: "acm-form-24dc7.firebaseapp.com",
    projectId: "acm-form-24dc7",
    storageBucket: "acm-form-24dc7.firebasestorage.app",
    messagingSenderId: "918528647383",
    appId: "1:918528647383:web:687300ddffd6f1de915092",
    measurementId: "G-TL0LNTLMVT"
  };
  

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  export {auth,provider};