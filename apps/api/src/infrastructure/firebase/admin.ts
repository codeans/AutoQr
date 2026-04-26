import admin from "firebase-admin";
import { logger } from "../../utils/logger.js";

let firebaseReady = false;

export function ensureFirebaseAdmin(): boolean {
  if (firebaseReady) return true;
  try {
    if (admin.apps.length === 0) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (raw) {
        admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
      } else {
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
      }
    }
    firebaseReady = true;
    return true;
  } catch (err) {
    logger.warn("firebase.admin_unavailable", { err: (err as Error).message });
    return false;
  }
}

export { admin as firebaseAdmin };
