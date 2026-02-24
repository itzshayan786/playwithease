import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAxuYwom2tuGTz3Nsi-6ndYSwK7BkEJIVs",
    authDomain: "playwithease.firebaseapp.com",
    projectId: "playwithease",
    storageBucket: "playwithease.firebasestorage.app",
    messagingSenderId: "189729941006",
    appId: "1:189729941006:web:362653774b92416c357e5f",
    measurementId: "G-1C3B31KQ7C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
    auth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    googleProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    updateProfile
};
