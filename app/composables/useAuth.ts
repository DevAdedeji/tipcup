import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth'
import { doc, getDoc, onSnapshot, type DocumentData } from 'firebase/firestore'
import { auth, db } from '~/firebase'

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
    // Enable the provider under Firebase Console -> Authentication -> Sign-in method.
    'auth/operation-not-allowed': 'This sign-in method is not enabled for this project.',
    'auth/unauthorized-domain': 'This domain is not authorised in your Firebase project.',
    'auth/invalid-api-key': 'Firebase is misconfigured — check your FIREBASE_* environment variables.',
    'auth/account-exists-with-different-credential':
        'An account with this email already exists using a different sign-in method.',
    'auth/requires-recent-login': 'Please sign in again to continue.',
}

export const authErrorMessage = (error: any): string =>
    AUTH_ERRORS[error?.code] || error?.message || 'Something went wrong. Please try again.'

export const useAuth = () => {

    const user = useState<User | null>('user', () => null)
    const userProfile = useState<DocumentData | null>('userProfile', () => null)
    const loading = useState<boolean>('authLoading', () => true)

    let unsubscribeProfile: (() => void) | undefined

    const initAuth = () => {
        loading.value = true
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
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: 'select_account' })

        const result = await signInWithPopup(auth, provider)
        user.value = result.user

        // Sign-in already succeeded; a failed profile read must not undo it.
        // The auth listener will populate the profile shortly either way.
        try {
            const docSnap = await getDoc(doc(db, 'users', result.user.uid))
            userProfile.value = docSnap.exists() ? docSnap.data() : null
        } catch (error) {
            console.error('Could not load profile after sign-in:', error)
        }

        return result.user
    }

    const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password)

        if (displayName?.trim()) {
            await updateProfile(result.user, { displayName: displayName.trim() })
        }

        user.value = result.user
        userProfile.value = null
        return result.user
    }

    const signInWithEmail = async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password)
        user.value = result.user
        return result.user
    }

    const logout = async () => {
        try {
            await signOut(auth)
            user.value = null
            userProfile.value = null
            navigateTo('/')
            const toast = useToast()
            toast.add({
                title: 'Signed out',
                description: 'You have been successfully signed out.',
                type: 'success'
            })
        } catch (error: any) {
            console.error('Error signing out:', error)
            const toast = useToast()
            toast.add({
                title: 'Sign out failed',
                description: error.message || 'Could not sign out.',
                type: 'error'
            })
        }
    }

    /**
     * Fresh ID token for calls to money-moving endpoints, which identify the
     * caller from the token rather than from the request body.
     */
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
