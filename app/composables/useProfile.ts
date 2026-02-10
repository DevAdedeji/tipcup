import {
    collection,
    query,
    where,
    getDocs,
    limit,
    doc,
    orderBy
} from 'firebase/firestore'
import { db } from '~/firebase'

export interface PublicProfile {
    uid: string
    username: string
    displayName: string
    bio: string
    avatarUrl: string
    coverUrl?: string
    tiers: any[]
    socialLinks?: { platform: string, url: string }[]
    fundraisingGoal?: any
    createdAt: any
}

export const useProfile = () => {
    const loading = useState('profileLoading', () => false)
    const error = useState('profileError', () => null)

    const fetchProfileByUsername = async (username: string): Promise<PublicProfile | null> => {
        loading.value = true
        error.value = null

        try {
            const normalizedUsername = username.toLowerCase()

            const usersRef = collection(db, 'users')
            const q = query(usersRef, where('username', '==', normalizedUsername), limit(1))
            const querySnapshot = await getDocs(q)

            const userDoc = querySnapshot.docs[0]

            if (!userDoc) {
                loading.value = false
                return null
            }

            const userData = userDoc.data()

            const profile: PublicProfile = {
                uid: userDoc.id,
                username: userData.username,
                displayName: userData.displayName,
                bio: userData.bio || '',
                avatarUrl: userData.avatarUrl || '',
                coverUrl: userData.coverUrl || '',
                tiers: userData.tiers || [],
                socialLinks: userData.socialLinks || [],
                createdAt: userData.createdAt
            }

            // Fetch active goal
            const goalsReff = collection(db, 'users', userDoc.id, 'goals')
            const qGoal = query(goalsReff, where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(1))
            const goalSnapshot = await getDocs(qGoal)

            const goalDoc = goalSnapshot.docs[0]

            if (goalDoc) {
                profile.fundraisingGoal = {
                    id: goalDoc.id,
                    ...goalDoc.data()
                }
            }

            // Increment view count (fire and forget)
            if (process.client) {
                const userRef = doc(db, 'users', userDoc.id)
                // Use increment from firestore
                import('firebase/firestore').then(({ increment, updateDoc }) => {
                    const today = new Date().toISOString().split('T')[0]
                    updateDoc(userRef, {
                        views: increment(1),
                        [`analytics.${today}.views`]: increment(1)
                    }).catch(e => console.error('Error incrementing views:', e))
                })
            }

            loading.value = false
            return profile

        } catch (e: any) {
            console.error('Error fetching profile:', e)
            error.value = e.message
            loading.value = false
            return null
        }
    }

    return {
        fetchProfileByUsername,
        loading,
        error
    }
}
