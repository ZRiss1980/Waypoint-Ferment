// /src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyDXfQ-qo9F9A7La8kQUYlLZe1s4hzNLfgc",
  authDomain: "brewery-app-bf7f1.firebaseapp.com",
  projectId: "brewery-app-bf7f1",
  storageBucket: "brewery-app-bf7f1.firebasestorage.app",
  messagingSenderId: "510816060680",
  appId: "1:510816060680:web:dc093e75d61ea7ae8f98bd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

export { db, auth }; 
