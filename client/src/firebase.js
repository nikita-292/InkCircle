// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "inkcircle-15d65.firebaseapp.com",
  projectId: "inkcircle-15d65",
  storageBucket: "inkcircle-15d65.firebasestorage.app",
  messagingSenderId: "315528163847",
  appId: "1:315528163847:web:01cffe230a900b3647b0a2",
  measurementId: "G-QN2QNLM31B"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

if (window.location.hostname === 'localhost') {
  auth.settings.appVerificationDisabledForTesting = true // Bypass domain checks (DEV ONLY)
}
