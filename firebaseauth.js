// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
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

async function initFirebase() {
  try {
    const res = await fetch("/config.json", { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to load Firebase config (/config.json). Status:", res.status);
      return;
    }
    const firebaseConfig = await res.json();
    initializeApp(firebaseConfig);

    const auth = getAuth();
    const db = getFirestore();

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
            const userData = {
              email: email,
              firstName: firstName,
              lastName: lastName,
            };
            showMessage("Account Created Successfully", "signUpMessage");
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
              .then(() => {
                window.location.href = "index.html";
              })
              .catch((error) => {
                console.error("error writing document", error);
              });
          })
          .catch((error) => {
            const errorCode = error.code;
            if (errorCode == "auth/email-already-in-use") {
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
  } catch (err) {
    console.error("Error initializing Firebase:", err);
  }
}

initFirebase();