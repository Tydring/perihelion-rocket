# Security Implementation Plan for Lagunita Health Club App

## 🚨 Critical Priority (Immediate Action Required)

### 1. Firestore Security Rules (Data Exposure Prevention)
**Current State:** `allow read, write: if true;` (Completely open)
**Risk:** Anyone can read all bookings (including health data/emails) and modify/delete classes.
**Plan:**
- **Classes Collection:**
    - `read`: Allow public access (needed for schedule).
    - `write`: create/update/delete ONLY with valid Admin auth/token.
- **Bookings Collection:**
    - `create`: Allow public access (needed for booking form), but validate data types and required fields.
    - `read`: DENY public access. Only Admin can read bookings.
    - `update/delete`: DENY public access. Only Admin or Cloud Functions can modify.
- **Data Validation Rules:** Enforce schema in security rules (e.g., `request.resource.data.userName is string`, `userAge > 0`).

### 2. Admin Authentication (Admin Panel Protection)
**Current State:** Hidden `/admin` route unmonitored.
**Risk:** Anyone who guesses the URL can delete classes or view bookings.
**Plan:**
- **Simple Auth:** Implement a logical "gate" for the `/admin` route.
- **Method:** Use Firebase Authentication (Anonymous + Email/Password) OR a simple client-side "PIN" stored in Environment Variables (less secure but fits "simple" requirement).
- **Recommendation:** **Firebase Authentication (Email/Password)** for the owner account.
    - Create one single admin account manually in Firebase Console.
    - Wrap `/admin` route in a `RequireAuth` component.
    - If not logged in, redirect to `/login`.

### 3. Rate Limiting (Spam Prevention)
**Current State:** None.
**Risk:** Malicious actor fills all class slots with fake bookings.
**Plan:**
- **Frontend Throttling:** Prevent double-clicking "Submit" (already implemented via disabled button state).
- **LocalStorage Check:** Limit bookings from same device/browser to X per day.
- **Cloud Functions (Advanced):** If using a backend function for booking, implement IP-based rate limiting (using Firestore counters or Redis). *For this MVP, Frontend + LocalStorage is a good first step.*

---

## 🟠 High Priority (Data Protection & Privacy)

### 4. Health Data Protection (Privacy)
**Current State:** Stored as plain text in `healthConditions` field.
**Risk:** Leak of sensitive personal health information if DB is compromised.
**Plan:**
- **Minimization:** Only collect what is absolutely necessary.
- **Access Control:** Strictly enforced via Firestore Rules (as above).
- **Encryption at Rest:** Firestore encrypts data at rest by default.
- **Privacy Policy:** Add a link to a privacy policy on the booking form stating how data is used.

### 5. Input Sanitization (XSS Prevention)
**Current State:** React handles most XSS, but raw data could be dangerous if exported.
**Risk:** Stored Cross-Site Scripting (XSS) if malicious scripts are injected into "Name" or "Conditions".
**Plan:**
- **Validation:** Use a library like `zod` or regex to ensure names contain only letters/spaces.
- **Sanitization:** Strip HTML tags from `healthConditions` input before sending to Firestore.

---

## 🟡 Medium Priority (Best Practices)

### 6. Environment Variables
**Current State:** Firebase config is public (safe), but Admin secrets might be exposed if hardcoded.
**Plan:**
- Move any Admin PINs or specific configuration keys to `.env` files (already gitignored).
- Use `import.meta.env.VITE_...` for accessing them.

### 7. CORS Configuration
**Current State:** Firebase Hosting handles this, generally permissive.
**Plan:**
- If we add Cloud Functions, explicitly set CORS headers to allow requests ONLY from `lhc-gym.web.app`.

### 8. Email Validation
**Current State:** Basic HTML5 email input.
**Risk:** Invalid emails prevent communication/reminders.
**Plan:**
- strict regex validation on the frontend.
- (Optional) Verification step (too complex for "no-login" flow, so skip for now).

---

## implementation Strategy

### Phase 1: Lockdown (Day 1)
1.  Set up Firebase Auth (Email/Password) for 1 Admin user.
2.  Update `firestore.rules` to restrict writes to authenticated Admin only.
3.  Protect `/admin` route in React Router.

### Phase 2: Booking Security (Day 2)
1.  Add input validation (Regex/Zod) to `BookingForm`.
2.  Implement "max boookings per device" check in `useBooking` hook.
3.  Add Privacy Policy disclaimer to modal.

### Phase 3: Infrastructure (Day 3)
1.  Audit `.env` usage.
2.  Verify HTTPS/CORS settings.
