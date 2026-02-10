import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth'
import { doc, getDoc, type DocumentData } from 'firebase/firestore'
import { auth, db } from '~/firebase'

export const useAuth = () => {

    const user = useState<User | null>('user', () => null)
    const userProfile = useState<DocumentData | null>('userProfile', () => null)
    const loading = useState<boolean>('authLoading', () => true)


    const initAuth = () => {
        loading.value = true
        onAuthStateChanged(auth, async (currentUser) => {
            user.value = currentUser

            if (currentUser) {

                try {
                    const docRef = doc(db, 'users', currentUser.uid)
                    const docSnap = await getDoc(docRef)
                    if (docSnap.exists()) {
                        userProfile.value = docSnap.data()
                    } else {
                        userProfile.value = null
                    }
                } catch (e) {
                    console.error('Error fetching user profile:', e)
                    userProfile.value = null
                }
            } else {
                userProfile.value = null
            }

            loading.value = false
        })
    }

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        try {
            const result = await signInWithPopup(auth, provider)
            const docRef = doc(db, 'users', result.user.uid)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                userProfile.value = docSnap.data()
            } else {
                userProfile.value = null
            }
            return result.user
        } catch (error: any) {
            console.error('Error signing in with Google:', error)
            const toast = useToast()
            toast.add({
                title: 'Sign in failed',
                description: error.message || 'Could not sign in with Google.',
                type: 'error'
            })
            throw error
        }
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

    return {
        user,
        userProfile,
        loading,
        initAuth,
        signInWithGoogle,
        logout
    }
}
