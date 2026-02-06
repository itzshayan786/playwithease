import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxuYwom2tuGTz3Nsi-6ndYSwK7BkEJIVs",
  authDomain: "playwithease.firebaseapp.com",
  projectId: "playwithease",
  storageBucket: "playwithease.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.signup = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = "index.html")
    .catch(e => alert(e.message));
};

window.login = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = "index.html")
    .catch(e => alert(e.message));
};

window.logout = () => {
  signOut(auth).then(() => window.location.href = "login.html");
};

onAuthStateChanged(auth, user => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  if (!loginBtn || !logoutBtn) return;
  loginBtn.style.display = user ? "none" : "inline";
  logoutBtn.style.display = user ? "inline" : "none";
});
