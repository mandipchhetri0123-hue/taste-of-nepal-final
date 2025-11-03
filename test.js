import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyBwzQLcI4g0FnA7ZIssKmEgqVm-lVXfok8",
  authDomain: "taste-of-nepal-3af40.firebaseapp.com",
  projectId: "taste-of-nepal-3af40",
  storageBucket: "taste-of-nepal-3af40.firebasestorage.app",
  messagingSenderId: "954024083207",
  appId: "1:954024083207:web:fa942e64932e4a64778fa2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase initialized:", db);