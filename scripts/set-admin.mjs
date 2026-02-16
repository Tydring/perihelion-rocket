#!/usr/bin/env node
/**
 * One-time script to set admin custom claim on a Firebase Auth user.
 * Usage: node scripts/set-admin.mjs <user-email>
 *
 * Requires: firebase-admin (uses Application Default Credentials from gcloud/firebase CLI)
 * Run after creating the admin user in Firebase Console > Authentication.
 */
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];
if (!email) {
    console.error("Usage: node scripts/set-admin.mjs <user-email>");
    process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: "gym-booking-vzla" });

const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { admin: true });
console.log(`Admin claim set for ${email} (uid: ${user.uid})`);
