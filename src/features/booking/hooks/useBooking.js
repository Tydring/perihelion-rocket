import { useState } from "react";
import { runTransaction, doc } from "firebase/firestore";
import { db, requestFcmToken } from "../../../lib/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

export function useBooking() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const bookClass = async (classId, userData, wantsReminder = false) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Request FCM token before the transaction if user wants reminders
            let fcmToken = null;
            if (wantsReminder && VAPID_KEY) {
                try {
                    fcmToken = await requestFcmToken(VAPID_KEY);
                } catch (tokenErr) {
                    console.warn("Could not get FCM token:", tokenErr);
                }
            }

            await runTransaction(db, async (transaction) => {
                const classRef = doc(db, "classes", classId);
                const classSnap = await transaction.get(classRef);

                if (!classSnap.exists()) {
                    throw new Error("Class does not exist!");
                }

                const classData = classSnap.data();

                if (classData.bookedCount >= classData.capacity) {
                    throw new Error("Class is fully booked!");
                }

                const bookingId = `${classId}_${userData.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const bookingRef = doc(db, "bookings", bookingId);
                const bookingSnap = await transaction.get(bookingRef);

                if (bookingSnap.exists()) {
                    throw new Error("You have already booked this class!");
                }

                // Build booking data with canonical field names
                const bookingData = {
                    classId,
                    userName: userData.name,
                    userEmail: userData.email,
                    userAge: userData.age,
                    healthConditions: userData.healthConditions || "",
                    createdAt: new Date(),
                    reminderSent: false
                };

                if (fcmToken) {
                    bookingData.fcmToken = fcmToken;
                }

                transaction.set(bookingRef, bookingData);

                // Increment bookedCount
                transaction.update(classRef, {
                    bookedCount: classData.bookedCount + 1
                });
            });

            setSuccess(true);
        } catch (err) {
            console.error("Booking failed: ", err);
            setError(err.message || "Failed to book class");
        } finally {
            setLoading(false);
        }
    };

    return { bookClass, loading, error, success, reset: () => { setError(null); setSuccess(false); } };
}
