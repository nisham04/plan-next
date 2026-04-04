import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOzc2-bdVB1rFqatE8QTY_iraM2xuyaN8",
  authDomain: "planbite-c7a2d.firebaseapp.com",
  projectId: "planbite-c7a2d",
  storageBucket: "planbite-c7a2d.firebasestorage.app",
  messagingSenderId: "780988699434",
  appId: "1:780988699434:web:06349dc76a9725b6f10453"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
  const sharedDocRef = doc(db, 'users', 'shared-kitchen-v1');
  const snap = await getDoc(sharedDocRef);
  if (snap.exists()) {
    console.log("Shared Data Found:", JSON.stringify(snap.data(), null, 2).substring(0, 500) + "...");
  } else {
    console.log("No shared data found at 'shared-kitchen-v1'");
  }
}

checkData();
