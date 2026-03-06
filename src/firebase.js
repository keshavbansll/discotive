import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_GwuNSbydGXQrfv7SJxQnrHW05SJ2lZk",
  authDomain: "discotivehub.firebaseapp.com",
  projectId: "discotivehub",
  storageBucket: "discotivehub.firebasestorage.app",
  messagingSenderId: "1092162372161",
  appId: "1:1092162372161:web:2b4f3d33c4f8fff85fbcc0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
