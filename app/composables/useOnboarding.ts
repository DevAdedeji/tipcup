import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore'

export const useOnboarding = () => {
    const { $db } = useNuxtApp()
    const { user } = useAuth()

    // Check if a username is already taken
    const checkUsernameAvailability = async (username: string): Promise<boolean> => {
        // Basic validation
        if (!username || username.length < 3) return false

        // Normalize
        const normalizedUsername = username.toLowerCase()

        // Regex Validation: alphanumeric, hyphens, underscores only. No spaces.
        const usernameRegex = /^[a-z0-9-_]+$/
        if (!usernameRegex.test(normalizedUsername)) return false

        // Forbidden usernames (expanded list)
        const forbidden = [
            'admin', 'administrator', 'root', 'sysadmin',
            'support', 'help', 'info', 'contact', 'legal', 'privacy', 'terms',
            'api', 'app', 'dashboard', 'settings', 'auth', 'login', 'signup',
            'logout', 'register', 'profile', 'user', 'users', 'group', 'groups',
            'create', 'edit', 'delete', 'update', 'remove', 'add', 'new',
            'feed', 'explore', 'search', 'notifications', 'messages', 'inbox',
            'tipcup', 'tip', 'cup', 'blog', 'news', 'status', 'bot'
        ]
        if (forbidden.includes(normalizedUsername)) return false

        try {
            const usersRef = collection($db, 'users')
            const q = query(usersRef, where('username', '==', normalizedUsername))
            const querySnapshot = await getDocs(q)

            return querySnapshot.empty
        } catch (error: any) {
            console.error('Error checking username:', error)
            const toast = useToast()
            toast.add({
                title: 'Error',
                description: 'Could not check username availability. Please try again.',
                type: 'error'
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

        try {
            const isAvailable = await checkUsernameAvailability(normalizedUsername)
            if (!isAvailable) {
                const toast = useToast()
                toast.add({
                    title: 'Username taken',
                    description: 'This username was just taken. Please choose another.',
                    type: 'error'
                })
                throw new Error('Username taken')
            }
        } catch (e) {
            throw e
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

            await setDoc(doc($db, 'users', user.value.uid), profileData)

            // Update local state immediately to prevent middleware redirect loop
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
