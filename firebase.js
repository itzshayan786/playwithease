<script type="module">
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
    storageBucket: "playwithease.firebasestorage.app",
    messagingSenderId: "189729941006",
    appId: "1:189729941006:web:362653774b92416c357e5f"
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
      .catch(() => alert("Invalid email or password"));
  };

  window.logout = () => {
    signOut(auth).then(() => window.location.href = "login.html");
  };

  onAuthStateChanged(auth, user => {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    if(!loginBtn || !logoutBtn) return;
    loginBtn.style.display = user ? "none" : "inline";
    logoutBtn.style.display = user ? "inline" : "none";
  });
</script>
