import { useState } from "react";
import { runTransaction, doc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export function useBooking() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const bookClass = async (classId, userData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
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

                // Check for duplicate booking (email + classId)
                // Note: In a transaction, we can't easily query collection unless we use unique document IDs based on email+classId
                // or accept a slight race condition for duplicates. 
                // For strict correctness, we should use a composite ID for the booking doc: `classId_userEmail`.

                const bookingId = `${classId}_${userData.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const bookingRef = doc(db, "bookings", bookingId);
                const bookingSnap = await transaction.get(bookingRef);

                if (bookingSnap.exists()) {
                    throw new Error("You have already booked this class!");
                }

                // Create booking
                transaction.set(bookingRef, {
                    classId,
                    ...userData,
                    createdAt: new Date()
                });

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
