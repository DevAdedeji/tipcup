import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null

if (!getApps().length && serviceAccount) {
    initializeApp({
        credential: cert(serviceAccount)
    })
} else if (!getApps().length) {
    // Fallback for environments with default credentials (e.g. Google Cloud)
    initializeApp()
}

export const adminDb = getFirestore()
export { FieldValue, Timestamp } from 'firebase-admin/firestore'
