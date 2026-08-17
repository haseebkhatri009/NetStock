import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

// 1) Firebase Console -> Project Settings -> General -> "Your apps" -> Web app
//    copy the config object below.
// 2) Enable "Email/Password" under Authentication -> Sign-in method.
// 3) Create a Realtime Database (not Firestore) and set rules (see README.md).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)

// A second, isolated Firebase app instance. We use this ONLY when an admin
// creates a new team-member login from the "Create User" page — creating a
// user with the normal auth instance would sign the admin OUT and sign the
// new user IN instead. Using a second app avoids disturbing the admin's
// active session.
export const secondaryApp = getApps().find((a) => a.name === 'Secondary')
  ? getApp('Secondary')
  : initializeApp(firebaseConfig, 'Secondary')
export const secondaryAuth = getAuth(secondaryApp)
