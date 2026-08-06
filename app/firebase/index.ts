import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

let app: FirebaseApp | undefined

export let auth: Auth = undefined as unknown as Auth
export let db: Firestore = undefined as unknown as Firestore

/**
 * Called once from the client plugin. Config is passed in rather than read here
 * because useRuntimeConfig() needs a Nuxt context, and the first Firestore call
 * often happens inside a timer or async callback where there isn't one.
 */
export const initFirebase = (config: FirebaseOptions): FirebaseApp => {
    if (app) return app

    if (!config?.apiKey) {
        throw new Error(
            'Firebase is not configured. Set the FIREBASE_* variables in .env and restart the dev server.'
        )
    }

    app = getApps().length ? getApps()[0]! : initializeApp(config)
    auth = getAuth(app)
    db = getFirestore(app)

    return app
}

export const isFirebaseReady = () => Boolean(app)
