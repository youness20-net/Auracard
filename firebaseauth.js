import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (!messageDiv) return;
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

async function loadConfig() {
  // runtime config file
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (res.ok) {
      const cfg = await res.json();
      if (cfg && cfg.apiKey) return cfg;
    }
  } catch (e) {}
  // runtime-injected global
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__ && window.__FIREBASE_CONFIG__.apiKey) {
    return window.__FIREBASE_CONFIG__;
  }
  // build-time env vars
  try {
    if (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
      };
    }
  } catch (e) {}
  console.warn('Firebase configuration not found. Provide it via /config.json, window.__FIREBASE_CONFIG__, or build-time envs.');
  return null;
}

async function initFirebase() {
  try {
    const firebaseConfig = await loadConfig();
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      console.error('Firebase not initialized: missing apiKey in firebaseConfig.');
      attachAuthlessHandlers();
      return;
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const signUp = document.getElementById("submitSignUp");
    if (signUp) {
      signUp.addEventListener("click", (event) => {
        event.preventDefault();
        const email = document.getElementById("rEmail").value;
        const password = document.getElementById("rPassword").value;
        const firstName = document.getElementById("fName").value;
        const lastName = document.getElementById("lName").value;

        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            const userData = { email, firstName, lastName };
            showMessage("Account Created Successfully", "signUpMessage");
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
              .then(() => { window.location.href = "index.html"; })
              .catch((error) => { console.error("error writing document", error); });
          })
          .catch((error) => {
            const errorCode = error.code;
            if (errorCode === "auth/email-already-in-use") {
              showMessage("Email Address Already Exists !!!", "signUpMessage");
            } else {
              showMessage("unable to create User", "signUpMessage");
            }
          });
      });
    }

    const signIn = document.getElementById("submitSignIn");
    if (signIn) {
      signIn.addEventListener("click", (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            showMessage("login is successful", "signInMessage");
            const user = userCredential.user;
            localStorage.setItem("loggedInUserId", user.uid);
            window.location.href = "homepage.html";
          })
          .catch((error) => {
            const errorCode = error.code;
            if (errorCode === "auth/invalid-credential") {
              showMessage("Incorrect Email or Password", "signInMessage");
            } else {
              showMessage("Account does not Exist", "signInMessage");
            }
          });
      });
    }

    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedInUserId");
        signOut(auth)
          .then(() => { window.location.href = "index.html"; })
          .catch(err => { console.error("Error signing out", err); });
      });
    }

  } catch (err) {
    console.error("Error initializing Firebase:", err);
    attachAuthlessHandlers();
  }
}

function attachAuthlessHandlers() {
  const signUp = document.getElementById("submitSignUp");
  if (signUp) {
    signUp.addEventListener("click", (e) => { e.preventDefault(); showMessage("Authentication is not configured.", "signUpMessage"); });
  }
  const signIn = document.getElementById("submitSignIn");
  if (signIn) {
    signIn.addEventListener("click", (e) => { e.preventDefault(); showMessage("Authentication is not configured.", "signInMessage"); });
  }
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => { localStorage.removeItem("loggedInUserId"); window.location.href = "index.html"; });
  }
}

initFirebase();
