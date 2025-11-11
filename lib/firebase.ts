// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBwzQLcI4g0FnA7ZIssKmEgqVm-lVXfok8",
  authDomain: "taste-of-nepal-3af40.firebaseapp.com",
  projectId: "taste-of-nepal-3af40",
  storageBucket: "taste-of-nepal-3af40.firebasestorage.app",
  messagingSenderId: "954024083207",
  appId: "1:954024083207:web:fa942e64932e4a64778fa2",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Only initialize messaging if running in browser
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

