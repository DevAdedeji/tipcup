import { adminDb, FieldValue } from '../../utils/admin'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const username = String(body?.username || '').toLowerCase()

    if (!username) {
        throw createError({ statusCode: 400, statusMessage: 'Username is required' })
    }

    const snapshot = await adminDb
        .collection('users')
        .where('username', '==', username)
        .limit(1)
        .get()

    const userDoc = snapshot.docs[0]
    if (!userDoc) return { recorded: false }

    const today = new Date().toISOString().split('T')[0]

    await userDoc.ref.update({
        views: FieldValue.increment(1),
        [`analytics.${today}.views`]: FieldValue.increment(1),
    })

    return { recorded: true }
})
