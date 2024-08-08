// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-realestate-3f5c7.firebaseapp.com",
  projectId: "mern-realestate-3f5c7",
  storageBucket: "mern-realestate-3f5c7.appspot.com",
  messagingSenderId: "982203617054",
  appId: "1:982203617054:web:ac37b68f017a3bab44c30f",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
