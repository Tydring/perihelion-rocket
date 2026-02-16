const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/**
 * Scheduled function that runs every 30 minutes to send class reminders.
 * Queries bookings where:
 *   - The class is today
 *   - The class starts within the next 2 hours
 *   - reminderSent is false
 *   - fcmToken exists
 */
exports.sendClassReminders = onSchedule("every 30 minutes", async () => {
    const now = new Date();
    const todayName = WEEKDAYS[now.getDay()];

    // Get all classes for today
    const classesSnap = await db
        .collection("classes")
        .where("dayOfWeek", "==", todayName)
        .where("isCancelled", "==", false)
        .get();

    if (classesSnap.empty) return;

    // Filter classes starting within the next 2 hours
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const upcomingClasses = [];

    classesSnap.forEach((doc) => {
        const data = doc.data();
        const [hours, mins] = data.startTime.split(":").map(Number);
        const classMinutes = hours * 60 + mins;
        const diff = classMinutes - currentMinutes;

        if (diff > 0 && diff <= 120) {
            upcomingClasses.push({ id: doc.id, ...data });
        }
    });

    if (upcomingClasses.length === 0) return;

    // For each upcoming class, find bookings that need reminders
    const classIds = upcomingClasses.map((c) => c.id);
    const classMap = Object.fromEntries(upcomingClasses.map((c) => [c.id, c]));

    // Firestore 'in' queries support max 30 values
    const chunks = [];
    for (let i = 0; i < classIds.length; i += 30) {
        chunks.push(classIds.slice(i, i + 30));
    }

    const batch = db.batch();
    const sendPromises = [];

    for (const chunk of chunks) {
        const bookingsSnap = await db
            .collection("bookings")
            .where("classId", "in", chunk)
            .where("reminderSent", "==", false)
            .get();

        bookingsSnap.forEach((bookingDoc) => {
            const booking = bookingDoc.data();
            if (!booking.fcmToken) return;

            const classInfo = classMap[booking.classId];
            if (!classInfo) return;

            sendPromises.push(
                messaging.send({
                    token: booking.fcmToken,
                    notification: {
                        title: `${classInfo.name} comienza pronto!`,
                        body: `Tu clase de ${classInfo.name} con ${classInfo.instructor} empieza a las ${classInfo.startTime}. Te esperamos!`
                    }
                }).catch((err) => {
                    console.error(`Failed to send to ${bookingDoc.id}:`, err.message);
                })
            );

            batch.update(bookingDoc.ref, { reminderSent: true });
        });
    }

    await Promise.all(sendPromises);
    await batch.commit();

    console.log(`Sent ${sendPromises.length} reminders for ${upcomingClasses.length} upcoming classes.`);
});
