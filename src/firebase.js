import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// TODO: Replace with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAOzc2-bdVB1rFqatE8QTY_iraM2xuyaN8",
  authDomain: "planbite-c7a2d.firebaseapp.com",
  projectId: "planbite-c7a2d",
  storageBucket: "planbite-c7a2d.firebasestorage.app",
  messagingSenderId: "780988699434",
  appId: "1:780988699434:web:06349dc76a9725b6f10453"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable Offline Persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore persistence failed: Multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore persistence failed: Not supported by browser");
    }
  });
} catch (err) {
  console.error("Firestore persistence error:", err);
}

export { 
  db, 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
};
