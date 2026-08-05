import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Config comes from Nuxt runtime config (the .env uses unprefixed FIREBASE_*,
// so import.meta.env.VITE_* was always undefined). Construction is deferred so
// the SDK is never instantiated during SSR of the public pages.
let app: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Firestore | undefined

const getFirebaseApp = (): FirebaseApp => {
    if (app) return app
    if (getApps().length) {
        app = getApps()[0]!
        return app
    }

    const config = useRuntimeConfig().public.firebase as Record<string, string>

    if (!config?.apiKey) {
        throw new Error(
            'Firebase is not configured. Set FIREBASE_API_KEY and the other FIREBASE_* variables in your .env.'
        )
    }

    app = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        appId: config.appId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        measurementId: config.measurementId,
    })

    return app
}

const lazy = <T extends object>(resolve: () => T): T =>
    new Proxy({} as T, {
        get: (_target, prop, receiver) => Reflect.get(resolve() as object, prop, receiver),
        set: (_target, prop, value, receiver) => Reflect.set(resolve() as object, prop, value, receiver),
        has: (_target, prop) => prop in (resolve() as object),
        getPrototypeOf: () => Object.getPrototypeOf(resolve()),
    })

export const auth: Auth = lazy(() => (authInstance ??= getAuth(getFirebaseApp())))
export const db: Firestore = lazy(() => (dbInstance ??= getFirestore(getFirebaseApp())))
