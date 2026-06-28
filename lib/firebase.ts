import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  )
}

let app: FirebaseApp | undefined
let auth: Auth | undefined
let analyticsInitStarted = false

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local'
    )
  }
  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig)
    initAnalyticsIfSupported()
  }
  return app
}

/** Optional Firebase Analytics — browser only, non-blocking */
function initAnalyticsIfSupported() {
  if (analyticsInitStarted || typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return
  analyticsInitStarted = true

  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) =>
      isSupported().then((supported) => {
        if (supported && app) getAnalytics(app)
      })
    )
    .catch(() => {})
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

export async function signInWithGooglePopup(): Promise<string> {
  const firebaseAuth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(firebaseAuth, provider)
  return result.user.getIdToken()
}

export async function firebaseSignOut(): Promise<void> {
  if (!isFirebaseConfigured()) return
  try {
    await signOut(getFirebaseAuth())
  } catch {
    /* ignore */
  }
}
