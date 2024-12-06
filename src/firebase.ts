// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCichl0Ww7Hs0j-Ko0q0FJLETeyzsvtE_Y",
  authDomain: "timezone-converter-c658d.firebaseapp.com",
  projectId: "timezone-converter-c658d",
  storageBucket: "timezone-converter-c658d.firebasestorage.app",
  messagingSenderId: "645257825142",
  appId: "1:645257825142:web:d29af4534e3aa9d5558857",
  measurementId: "G-HDE888W9PT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);