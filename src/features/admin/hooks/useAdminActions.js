import { useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export function useAdminActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addClass = async (classData) => {
        setLoading(true);
        setError(null);
        try {
            // Ensure bookedCount is initialized
            const data = {
                ...classData,
                bookedCount: 0,
                isCancelled: false,
                createdAt: new Date()
            };
            await addDoc(collection(db, "classes"), data);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateClass = async (id, updates) => {
        setLoading(true);
        setError(null);
        try {
            const docRef = doc(db, "classes", id);
            await updateDoc(docRef, updates);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteClass = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const docRef = doc(db, "classes", id);
            await deleteDoc(docRef);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { addClass, updateClass, deleteClass, loading, error };
}
