import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBTvO8fq7XElwbtV_YbcCkJjVfnzDaovoQ",
    authDomain: "gym-booking-vzla.firebaseapp.com",
    projectId: "gym-booking-vzla",
    storageBucket: "gym-booking-vzla.firebasestorage.app",
    messagingSenderId: "305772879594",
    appId: "1:305772879594:web:d29c9a33a9e744df368193"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CLASSES = [
    // Lunes
    { name: "Yoga", instructor: "Instructor", dayOfWeek: "Lunes", startTime: "07:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "STEP", instructor: "Instructor", dayOfWeek: "Lunes", startTime: "08:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "Spinning", instructor: "Instructor", dayOfWeek: "Lunes", startTime: "08:00", durationMinutes: 45, capacity: 20, bookedCount: 0, isCancelled: false },
    { name: "TRX", instructor: "Instructor", dayOfWeek: "Lunes", startTime: "19:30", durationMinutes: 60, capacity: 12, bookedCount: 0, isCancelled: false },

    // Martes
    { name: "Yoga", instructor: "Instructor", dayOfWeek: "Martes", startTime: "07:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "Boxeo", instructor: "Instructor", dayOfWeek: "Martes", startTime: "08:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "Spinning", instructor: "Instructor", dayOfWeek: "Martes", startTime: "08:00", durationMinutes: 45, capacity: 20, bookedCount: 0, isCancelled: false },
    { name: "Funcional", instructor: "Instructor", dayOfWeek: "Martes", startTime: "09:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "Baile", instructor: "Instructor", dayOfWeek: "Martes", startTime: "19:00", durationMinutes: 60, capacity: 20, bookedCount: 0, isCancelled: false },

    // Miércoles
    { name: "Spinning", instructor: "Instructor", dayOfWeek: "Miércoles", startTime: "07:00", durationMinutes: 45, capacity: 20, bookedCount: 0, isCancelled: false },
    { name: "TRX", instructor: "Instructor", dayOfWeek: "Miércoles", startTime: "08:00", durationMinutes: 60, capacity: 12, bookedCount: 0, isCancelled: false },
    { name: "Pilates", instructor: "Instructor", dayOfWeek: "Miércoles", startTime: "09:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "Yoga", instructor: "Instructor", dayOfWeek: "Miércoles", startTime: "18:30", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },

    // Jueves
    { name: "Yoga", instructor: "Instructor", dayOfWeek: "Jueves", startTime: "07:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "Funcional", instructor: "Instructor", dayOfWeek: "Jueves", startTime: "08:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "Spinning", instructor: "Instructor", dayOfWeek: "Jueves", startTime: "08:00", durationMinutes: 45, capacity: 20, bookedCount: 0, isCancelled: false },
    { name: "Baile", instructor: "Instructor", dayOfWeek: "Jueves", startTime: "09:00", durationMinutes: 60, capacity: 20, bookedCount: 0, isCancelled: false },
    { name: "Boxeo", instructor: "Instructor", dayOfWeek: "Jueves", startTime: "18:30", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "Spinning", instructor: "Instructor", dayOfWeek: "Jueves", startTime: "19:30", durationMinutes: 45, capacity: 20, bookedCount: 0, isCancelled: false },

    // Viernes
    { name: "Spinning", instructor: "Instructor", dayOfWeek: "Viernes", startTime: "07:00", durationMinutes: 45, capacity: 20, bookedCount: 0, isCancelled: false },
    { name: "Funcional", instructor: "Instructor", dayOfWeek: "Viernes", startTime: "08:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },
    { name: "Pilates", instructor: "Instructor", dayOfWeek: "Viernes", startTime: "09:00", durationMinutes: 60, capacity: 15, bookedCount: 0, isCancelled: false },

    // Sábado
    { name: "Spinning", instructor: "Instructor", dayOfWeek: "Sábado", startTime: "10:00", durationMinutes: 45, capacity: 20, bookedCount: 0, isCancelled: false },
];

async function seed() {
    console.log("Seeding classes...");
    for (const cls of CLASSES) {
        const docRef = await addDoc(collection(db, "classes"), {
            ...cls,
            createdAt: new Date()
        });
        console.log(`  Added: ${cls.dayOfWeek} - ${cls.name} @ ${cls.startTime} (ID: ${docRef.id})`);
    }
    console.log(`Done! Added ${CLASSES.length} classes.`);
}

seed().catch(console.error);
