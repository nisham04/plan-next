import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// TODO: Replace with your actual Firebase config from the Firebase Console
// Project Settings -> General -> Your apps -> Web app
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

// Enable Offline Persistence (Native Firestore Feature)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn("Firestore persistence failed: Multiple tabs open");
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn("Firestore persistence failed: Not supported by browser");
    }
  });
} catch (err) {
  console.error("Firestore persistence error:", err);
}

// Initial anonymous sign-in to get a unique UID for data isolation
signInAnonymously(auth).catch((error) => {
  console.error("Firebase Anonymous Auth Error:", error);
});

export { db, auth };
