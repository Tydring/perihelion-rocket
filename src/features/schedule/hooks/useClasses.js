import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export function useClasses(dayOfWeek = null) {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        // Fetch ALL classes and filter/sort client-side
        // This avoids the Firestore composite index requirement
        const q = query(collection(db, "classes"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let classesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter by day if specified
            if (dayOfWeek) {
                classesData = classesData.filter(c => c.dayOfWeek === dayOfWeek);
            }

            // Sort by startTime
            classesData.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

            setClasses(classesData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching classes:", err);
            setError(err.message || "Error al cargar las clases");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dayOfWeek]);

    return { classes, loading, error };
}
