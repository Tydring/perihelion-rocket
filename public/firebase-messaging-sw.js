/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBTvO8fq7XElwbtV_YbcCkJjVfnzDaovoQ",
    authDomain: "gym-booking-vzla.firebaseapp.com",
    projectId: "gym-booking-vzla",
    storageBucket: "gym-booking-vzla.firebasestorage.app",
    messagingSenderId: "305772879594",
    appId: "1:305772879594:web:d29c9a33a9e744df368193"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title || "Lagunita Health Club", {
        body: body || "Tienes una clase pronto!",
        icon: "/logo.png"
    });
});
