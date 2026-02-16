# Gym Booking App Implementation Plan

## Project Overview
A lightweight, mobile-first gym booking application for a small gym in Venezuela.
**Core Features:** No-login booking, weekly schedule, capacity management, admin dashboard.
**Tech Stack:** React (Vite), Tailwind CSS, Firebase (Firestore, Hosting).

## 1. Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Generic UI (Button, Input, Card, Modal)
│   ├── layout/          # Layout wrappers (MainLayout, AdminLayout)
│   └── shared/          # Shared specific components (Loader, ErrorMessage)
├── features/
│   ├── schedule/        # Public schedule view logic
│   │   ├── components/  # ScheduleGrid, ClassCard, DaySelector
│   │   └── hooks/       # useSchedule, useClassAvailability
│   ├── booking/         # Booking flow logic
│   │   ├── components/  # BookingModal, BookingForm, Confirmation
│   │   └── hooks/       # useBooking
│   └── admin/           # Admin dashboard logic
│       ├── components/  # ClassEditor, BookingList, ScheduleManager
│       └── hooks/       # useAdminActions
├── lib/                 # Configuration and utilities
│   ├── firebase.js      # Firebase initialization
│   ├── constants.js     # App constants (Weekdays, TimeSlots)
│   └── utils.js         # Date formatting, validation helpers
├── types/               # TypeScript interfaces (if using TS) or JSDoc types
└── App.jsx              # Main app component with routing
```

## 2. Firestore Data Model

### Collection: `classes`
Stores the weekly schedule and class details.
- `id`: string (auto-generated)
- `name`: string (e.g., "Yoga", "CrossFit")
- `instructor`: string
- `dayOfWeek`: string (e.g., "Monday", "Tuesday") - *Indexed for querying*
- `startTime`: string (e.g., "08:00") - *Store as 24h string for weekly recurring schedule*
- `durationMinutes`: number (e.g., 60)
- `capacity`: number (total spots, e.g., 20)
- `bookedCount`: number (current bookings, e.g., 5) - *Updated via transaction*
- `isCancelled`: boolean (default: false)

### Collection: `bookings`
Stores individual user bookings.
- `id`: string (auto-generated)
- `classId`: string (reference to `classes` doc)
- `userEmail`: string
- `userName`: string
- `userAge`: number
- `healthConditions`: string (optional)
- `bookingDate`: timestamp (date of the specific class instance)
- `createdAt`: timestamp
- `fcmToken`: string (Optional - for push notifications)
- `reminderSent`: boolean (default: false)

*Note: Since it's a weekly recurring schedule, valid booking dates will need to be calculated based on the `dayOfWeek`.*

## 6. Push Notification System (New)

**Goal:** Send reminders to users 1-2 hours before their class starts.

### Architecture
- **Frontend:**
    - Request notification permission in the Booking Modal (`Notification.requestPermission()`).
    - Get FCM Token using `getToken()`.
    - Save `fcmToken` in the `bookings` document.
- **Backend (Cloud Functions):**
    - `sendClassReminders`: A scheduled function running every 30 minutes.
    - Queries for bookings where:
        - `bookingDate` is Today.
        - `classTime` is within the next 2 hours.
        - `reminderSent` is false.
    - Sends a message via FCM to the stored token.
    - Updates `reminderSent` to true.

### Implementation Steps

#### Phase 1: Configuration
1.  **Enable FCM**: In Firebase Console > Project Settings > Cloud Messaging.
2.  **Generate VAPID Key**: Create a Web Push certificate.
3.  **Initialize Cloud Functions**: `firebase init functions` (Requires Blaze plan upgrade, but free tier limits are generous).

#### Phase 2: Frontend Integration
1.  **Service Worker**: Create `public/firebase-messaging-sw.js` to handle background messages.
2.  **Permission UI**: Add a "Receive Reminders" toggle in `BookingForm.jsx`.
3.  **Token Logic**:
    - If toggle is ON, call `getToken(messaging, { vapidKey: '...' })`.
    - Retrieve the token and add it to the booking data payload passed to `addBooking`.

#### Phase 3: Backend Logic
1.  **Scheduled Function**:
    ```javascript
    exports.sendClassReminders = onSchedule("every 30 minutes", async (event) => {
        // 1. Calculate time window (now + 2 hours)
        // 2. Query bookings matching criteria
        // 3. Loop through bookings and send FCM messages
        // 4. Batch update bookings to set reminderSent: true
    });
    ```

#### Phase 4: Testing
1.  **Local Testing**: Use `firebase emulators:start` to test functions locally.
2.  **Production Test**: Deploy and make a test booking for a class starting soon.
