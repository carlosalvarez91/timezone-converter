// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAnRD9xjX6ArrW1jmftdSZsqoXBPOjBY0w",
    authDomain: "timezone-converter-84e4a.firebaseapp.com",
    projectId: "timezone-converter-84e4a",
    storageBucket: "timezone-converter-84e4a.firebasestorage.app",
    messagingSenderId: "525248461272",
    appId: "1:525248461272:web:ab4b04b1502b390d711aad",
    measurementId: "G-BV5G6QM7WT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);