import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '~/firebase'

export const useOnboarding = () => {
    const { user } = useAuth()

    const checkUsernameAvailability = async (username: string): Promise<boolean> => {
        const normalized = (username || '').trim().toLowerCase()
        if (normalized.length < 3) return false

        try {
            const result = await $fetch<{ available: boolean; reason?: string }>(
                '/api/profile/username-available',
                { query: { username: normalized } }
            )
            return result.available
        } catch (error) {
            console.error('Error checking username:', error)
            useToast().add({
                title: 'Error',
                description: 'Could not check that username. Please try again.',
                type: 'error',
            })
            return false
        }
    }

    const completeOnboarding = async (data: {
        username: string,
        displayName: string,
        bio: string,
        tiers: any[],
        payoutDetails?: any
    }) => {
        if (!user.value) {
            const toast = useToast()
            toast.add({
                title: 'Error',
                description: 'You must be logged in to complete onboarding.',
                type: 'error'
            })
            throw new Error('User not authenticated')
        }

        const normalizedUsername = data.username.toLowerCase()

        const isAvailable = await checkUsernameAvailability(normalizedUsername)
        if (!isAvailable) {
            useToast().add({
                title: 'Username taken',
                description: 'That username was just taken. Please choose another.',
                type: 'error'
            })
            throw new Error('Username taken')
        }

        try {
            const profileData = {
                uid: user.value.uid,
                username: normalizedUsername,
                displayName: data.displayName,
                bio: data.bio,
                avatarUrl: user.value.photoURL,
                email: user.value.email,
                tiers: data.tiers,
                payoutDetails: data.payoutDetails || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }

            await setDoc(doc(db, 'users', user.value.uid), profileData)

            const { userProfile } = useAuth()
            userProfile.value = profileData

            const toast = useToast()
            toast.add({
                title: 'Welcome to TipCup!',
                description: 'Your page is ready.',
                type: 'success'
            })

            return true
        } catch (error: any) {
            console.error('Error saving profile:', error)
            const toast = useToast()
            toast.add({
                title: 'Setup failed',
                description: error.message || 'Could not save your profile. Please try again.',
                type: 'error'
            })
            throw error
        }
    }

    return {
        checkUsernameAvailability,
        completeOnboarding
    }
}
