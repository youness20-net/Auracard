import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Resolve config from /config.json, window.__FIREBASE_CONFIG__, or env vars
async function loadFirebaseConfig() {
  // 1) Try runtime config file (recommended)
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (res.ok) {
      const cfg = await res.json();
      if (cfg && cfg.apiKey) return cfg;
    }
  } catch (e) {}
  // 2) Try runtime-injected global
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__ && window.__FIREBASE_CONFIG__.apiKey) {
    return window.__FIREBASE_CONFIG__;
  }
  // 3) Try build-time env vars (Vite)
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

async function initAppAndAuth() {
  const firebaseConfig = await loadFirebaseConfig();
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    console.error('Firebase not initialized: missing apiKey in config.');
    return;
  }
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  onAuthStateChanged(auth, user => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      const docRef = doc(db, 'users', loggedInUserId);
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const nameEl = document.getElementById('loggedUserFName');
          const emailEl = document.getElementById('loggedUserEmail');
          const lNameEl = document.getElementById('loggedUserLName');
          if (nameEl) nameEl.innerText = userData.firstName || '';
          if (emailEl) emailEl.innerText = userData.email || '';
          if (lNameEl) lNameEl.innerText = userData.lastName || '';
        } else {
          console.log('no document found matching id');
        }
      }).catch(error => {
        console.error('Error getting document', error);
      });
    } else {
      console.log('User Id not Found in Local storage');
    }
  });

  const logoutButton = document.getElementById('logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('loggedInUserId');
      signOut(auth).then(() => {
        window.location.href = 'index.html';
      }).catch(error => {
        console.error('Error Signing out:', error);
      });
    });
  } else {
    console.warn("logout button with id 'logout' not found on page");
  }
}

initAppAndAuth();
