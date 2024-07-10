// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0nRQOeSbGjaU8MTqoSqHWyRdnW6uUwRA",
  authDomain: "axa-kurse.firebaseapp.com",
  projectId: "axa-kurse",
  storageBucket: "axa-kurse.appspot.com",
  messagingSenderId: "764838342195",
  appId: "1:764838342195:web:35cdd6ba10b3c19ca1bd46",
  measurementId: "G-EEET61BR4W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);