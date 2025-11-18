import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import{getFirestore, getDoc, doc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Resolve Firebase config from (1) runtime-injected global, (2) Vite import.meta.env, (3) process.env, in that order.
const firebaseConfig = (() => {
  // 1) Runtime injection (recommended for static sites): during deploy write a small config file that sets window.__FIREBASE_CONFIG__
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
    return window.__FIREBASE_CONFIG__;
  }

  // 2) Vite-style build-time envs: import.meta.env.VITE_FIREBASE_*
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
  } catch (e) {
    // import.meta may not be available in some environments; ignore
  }

  // 3) CommonJS / webpack: process.env.FIREBASE_*
  if (typeof process !== 'undefined' && process.env && process.env.FIREBASE_API_KEY) {
    return {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };
  }

  // No config found
  console.warn('Firebase configuration not found. Provide it via window.__FIREBASE_CONFIG__ at runtime or set build-time env variables (VITE_FIREBASE_* or FIREBASE_*).');
  return {};
})();

// Initialize Firebase only if we have a key
let app;
if (firebaseConfig && firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
} else {
  console.error('Firebase not initialized: missing apiKey in firebaseConfig.');
}

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
  const loggedInUserId = localStorage.getItem('loggedInUserId');
  if (loggedInUserId) {
    console.log(user);
    const docRef = doc(db, 'users', loggedInUserId);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          document.getElementById('loggedUserFName').innerText = userData.firstName;
          document.getElementById('loggedUserEmail').innerText = userData.email;
          document.getElementById('loggedUserLName').innerText = userData.lastName;
        } else {
          console.log('no document found matching id');
        }
      })
      .catch((error) => {
        console.log('Error getting document');
      });
  } else {
    console.log('User Id not Found in Local storage');
  }
});

const logoutButton = document.getElementById('logout');

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
      .then(() => {
        window.location.href = 'index.html';
      })
      .catch((error) => {
        console.error('Error Signing out:', error);
      });
  });
} else {
  console.warn("logout button with id 'logout' not found on page");
}