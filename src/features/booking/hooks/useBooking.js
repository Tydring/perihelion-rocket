import { useState } from "react";
import { runTransaction, doc } from "firebase/firestore";
import { db, requestFcmToken } from "../../../lib/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
const MAX_BOOKINGS_PER_DAY = 5;
const RATE_LIMIT_KEY = "lhc_bookings_today";

function checkRateLimit() {
    try {
        const stored = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "{}");
        const today = new Date().toISOString().slice(0, 10);
        if (stored.date !== today) return true;
        return (stored.count || 0) < MAX_BOOKINGS_PER_DAY;
    } catch {
        return true;
    }
}

function incrementRateLimit() {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const stored = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "{}");
        if (stored.date !== today) {
            localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: today, count: 1 }));
        } else {
            localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: today, count: (stored.count || 0) + 1 }));
        }
    } catch { /* localStorage unavailable */ }
}

export function useBooking() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const bookClass = async (classId, userData, wantsReminder = false) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!checkRateLimit()) {
                throw new Error("Has alcanzado el límite de reservas por hoy. Intenta mañana.");
            }

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

            incrementRateLimit();
            setSuccess(true);
        } catch (err) {
            console.error("Booking failed: ", err);
            setError(err.message || "Failed to book class");
        } finally {
            setLoading(false);
        }
    };

    const joinWaitlist = async (classId, userData, wantsReminder = false) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Rate limit check still applies for waitlist to prevent spam
            if (!checkRateLimit()) {
                throw new Error("Has alcanzado el límite de solicitudes por hoy.");
            }

            // Request FCM token
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
                    throw new Error("La clase no existe.");
                }

                // Check if already in waitlist
                // Note: Ideally we query the subcollection, but in client-side transaction we can't easily query.
                // For MVP, we'll just add them. The unique ID (email based) prevents dupes if we use set().

                const waitlistId = `${userData.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const waitlistRef = doc(db, "classes", classId, "waitlist", waitlistId);
                const waitlistSnap = await transaction.get(waitlistRef);

                if (waitlistSnap.exists()) {
                    throw new Error("Ya estás en la lista de espera para esta clase.");
                }

                // Also check if they are already BOOKED
                const bookingId = `${classId}_${userData.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const bookingRef = doc(db, "bookings", bookingId);
                const bookingSnap = await transaction.get(bookingRef);

                if (bookingSnap.exists()) {
                    throw new Error("¡Ya tienes una reserva confirmada para esta clase!");
                }

                const entryData = {
                    userName: userData.name,
                    userEmail: userData.email,
                    userAge: userData.age,
                    createdAt: new Date(),
                    status: "waiting"
                };

                if (fcmToken) {
                    entryData.fcmToken = fcmToken;
                }

                transaction.set(waitlistRef, entryData);

                // Update class waitlist count
                transaction.update(classRef, {
                    waitlistCount: increment(1)
                });
            });

            incrementRateLimit();
            setSuccess(true);
        } catch (err) {
            console.error("Waitlist join failed: ", err);
            setError(err.message || "Error al unirse a la lista de espera");
        } finally {
            setLoading(false);
        }
    };

    return { bookClass, joinWaitlist, loading, error, success, reset: () => { setError(null); setSuccess(false); } };
}
