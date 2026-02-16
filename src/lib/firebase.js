import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

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

// FCM Messaging - lazily initialized since it requires browser support
let messagingInstance = null;

export async function getMessagingInstance() {
    if (messagingInstance) return messagingInstance;
    const supported = await isSupported();
    if (!supported) return null;
    messagingInstance = getMessaging(app);
    return messagingInstance;
}

export async function requestFcmToken(vapidKey) {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    return getToken(messaging, { vapidKey });
}
