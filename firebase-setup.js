import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let firebaseConfig;

// Load config from globals (set by firebase-env.js before this script runs)
if (window.EXPO_PUBLIC_FIREBASE_API_KEY) {
  firebaseConfig = {
    apiKey: window.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: window.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: window.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: window.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: window.EXPO_PUBLIC_FIREBASE_APP_ID
  };
} else if (window.__FIREBASE_CONFIG__) {
  firebaseConfig = window.__FIREBASE_CONFIG__;
} else {
  throw new Error('Missing Firebase config. Set EXPO_PUBLIC_FIREBASE_* globals via firebase-env.js or set window.__FIREBASE_CONFIG__');
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.deleteDoc = deleteDoc;
window.collection = collection;
window.query = query;
window.where = where;
window.getDocs = getDocs;
