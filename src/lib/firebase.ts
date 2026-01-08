import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAyGx_B2x6gjoi_m5Rt_dl6uLLbF9W8GrU",
    authDomain: "quanlychitieu-65b7f.firebaseapp.com",
    projectId: "quanlychitieu-65b7f",
    storageBucket: "quanlychitieu-65b7f.firebasestorage.app",
    messagingSenderId: "711182559478",
    appId: "1:711182559478:web:53ba73d62d20bc52eda4d7",
    measurementId: "G-SX3YF4TW0L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
