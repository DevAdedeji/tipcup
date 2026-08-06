import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth'
import { doc, getDoc, onSnapshot, type DocumentData } from 'firebase/firestore'
import { auth, db, isFirebaseReady } from '~/firebase'

const AUTH_ERRORS: Record<string, string> = {
    'auth/invalid-email': 'That email address is not valid.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Use at least 6 characters for your password.',
    'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
    'auth/network-request-failed': 'Check your connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Your browser blocked the sign-in popup.',
    'auth/missing-password': 'Enter your password.',
    'auth/invalid-login-credentials': 'Email or password is incorrect.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled for this project.',
    'auth/unauthorized-domain': 'This domain is not authorised in your Firebase project.',
    'auth/invalid-api-key': 'Firebase is misconfigured — check your FIREBASE_* environment variables.',
    'auth/account-exists-with-different-credential':
        'An account with this email already exists using a different sign-in method.',
    'auth/requires-recent-login': 'Please sign in again to continue.',
}

export const authErrorMessage = (error: any): string =>
    AUTH_ERRORS[error?.code] || error?.message || 'Something went wrong. Please try again.'

// Popup failures the user can neither see nor fix: blockers, COOP headers,
// in-app browsers, Safari storage rules. These fall back to redirect.
const POPUP_UNAVAILABLE = new Set([
    'auth/popup-blocked',
    'auth/cancelled-popup-request',
    'auth/operation-not-supported-in-this-environment',
    'auth/web-storage-unsupported',
    'auth/internal-error',
])

const assertReady = () => {
    if (!isFirebaseReady()) {
        throw new Error(
            'Firebase has not initialised. Restart the dev server so Nuxt reloads your .env.'
        )
    }
}

export const useAuth = () => {
    const user = useState<User | null>('user', () => null)
    const userProfile = useState<DocumentData | null>('userProfile', () => null)
    const loading = useState<boolean>('authLoading', () => true)

    let unsubscribeProfile: (() => void) | undefined

    const initAuth = () => {
        loading.value = true

        getRedirectResult(auth).catch((error) => {
            console.error('Redirect sign-in did not complete:', error?.code || error)
        })

        onAuthStateChanged(auth, async (currentUser) => {
            user.value = currentUser

            if (unsubscribeProfile) {
                unsubscribeProfile()
                unsubscribeProfile = undefined
            }

            if (currentUser) {
                try {
                    const docRef = doc(db, 'users', currentUser.uid)

                    unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
                        if (docSnap.exists()) {
                            userProfile.value = docSnap.data()
                        } else {
                            userProfile.value = null
                        }
                        loading.value = false
                    }, (error) => {
                        console.error('Error fetching user profile:', error)
                        userProfile.value = null
                        loading.value = false
                    })
                } catch (e) {
                    console.error('Error setting up profile listener:', e)
                    userProfile.value = null
                    loading.value = false
                }
            } else {
                userProfile.value = null
                loading.value = false
            }
        })
    }

    const signInWithGoogle = async () => {
        assertReady()

        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: 'select_account' })

        let result
        try {
            result = await signInWithPopup(auth, provider)
        } catch (error: any) {
            if (!POPUP_UNAVAILABLE.has(error?.code)) throw error

            console.warn('Popup sign-in unavailable, falling back to redirect:', error?.code)
            await signInWithRedirect(auth, provider)
            return null
        }

        user.value = result.user

        try {
            const docSnap = await getDoc(doc(db, 'users', result.user.uid))
            userProfile.value = docSnap.exists() ? docSnap.data() : null
        } catch (error) {
            console.error('Could not load profile after sign-in:', error)
        }

        return result.user
    }

    const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
        assertReady()
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password)

        if (displayName?.trim()) {
            await updateProfile(result.user, { displayName: displayName.trim() })
        }

        user.value = result.user
        userProfile.value = null
        return result.user
    }

    const signInWithEmail = async (email: string, password: string) => {
        assertReady()
        const result = await signInWithEmailAndPassword(auth, email.trim(), password)
        user.value = result.user
        return result.user
    }

    const logout = async () => {
        try {
            // Drop the profile listener first: once auth is gone the snapshot
            // fails the security rules and throws a permission error.
            unsubscribeProfile?.()
            unsubscribeProfile = undefined

            await signOut(auth)

            user.value = null
            userProfile.value = null
            loading.value = false

            useToast().add({
                title: 'Signed out',
                description: 'See you soon.',
                type: 'success'
            })
        } catch (error: any) {
            console.error('Error signing out:', error)
            useToast().add({
                title: 'Sign out failed',
                description: authErrorMessage(error),
                type: 'error'
            })
            return
        }

        await navigateTo('/', { replace: true })
    }

    const getIdToken = async (): Promise<string> => {
        const current = auth.currentUser
        if (!current) {
            throw new Error('You need to be signed in to do that.')
        }
        return await current.getIdToken()
    }

    return {
        user,
        userProfile,
        loading,
        initAuth,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        logout,
        getIdToken
    }
}
