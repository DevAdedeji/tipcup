import { adminDb } from '../../utils/admin'

export default defineEventHandler(async (event) => {
    const username = getRouterParam(event, 'username')?.toLowerCase()

    if (!username) {
        throw createError({ statusCode: 400, statusMessage: 'Username is required' })
    }

    const snapshot = await adminDb
        .collection('users')
        .where('username', '==', username)
        .limit(1)
        .get()

    const userDoc = snapshot.docs[0]

    if (!userDoc) {
        throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
    }

    const data = userDoc.data()

    const profile: Record<string, any> = {
        uid: userDoc.id,
        username: data.username,
        displayName: data.displayName || data.username,
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
        coverUrl: data.coverUrl || '',
        tiers: data.tiers || [],
        socialLinks: data.socialLinks || [],
        fundraisingGoal: null,
    }

    const goalSnapshot = await userDoc.ref
        .collection('goals')
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get()

    const goalDoc = goalSnapshot.docs[0]

    if (goalDoc) {
        const goal = goalDoc.data()
        profile.fundraisingGoal = {
            id: goalDoc.id,
            title: goal.title,
            description: goal.description || '',
            targetAmount: goal.targetAmount || 0,
            currentAmount: goal.currentAmount || 0,
            status: goal.status,
        }
    }

    setHeader(event, 'Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300')

    return profile
})
