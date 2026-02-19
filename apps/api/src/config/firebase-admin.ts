import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;

if (getApps().length === 0) {
  // In production (Firebase Functions), auto-initializes with default credentials.
  // For local dev, uses GOOGLE_APPLICATION_CREDENTIALS env var or explicit service account.
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    app = initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    });
  } else {
    app = initializeApp();
  }
} else {
  app = getApps()[0];
}

export const firebaseAuth: Auth = getAuth(app);
export { app as firebaseApp };
