import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for Gym Booking Venezuela
const firebaseConfig = {
    apiKey: "AIzaSyBTvO8fq7XElwbtV_YbcCkJjVfnzDaovoQ",
    authDomain: "gym-booking-vzla.firebaseapp.com",
    projectId: "gym-booking-vzla",
    storageBucket: "gym-booking-vzla.firebasestorage.app",
    messagingSenderId: "305772879594",
    appId: "1:305772879594:web:d29c9a33a9e744df368193"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
