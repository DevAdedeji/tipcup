import { verifyTransaction } from '../../utils/paystack'
import { adminDb } from '../../utils/admin'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { reference } = body

    if (!reference) {
        throw createError({ statusCode: 400, statusMessage: 'Reference is required' })
    }

    try {
        const response: any = await verifyTransaction(reference)

        if (response.data.status === 'success') {
            // Check if payment already exists (prevent duplicates)
            const paymentRef = adminDb.collection('payments').where('reference', '==', reference).limit(1)
            const snapshot = await paymentRef.get()

            if (snapshot.empty) {
                // Extract payment data
                const { amount, customer, metadata } = response.data

                // Create payment record
                await adminDb.collection('payments').add({
                    reference,
                    amount: amount / 100, // Convert from kobo to naira
                    fromEmail: customer.email,
                    fromName: metadata.fromName || 'Anonymous',
                    fromUserId: metadata.fromUserId || null,
                    toUserId: metadata.toUserId,
                    goalId: metadata.goalId || null,
                    tier: metadata.tier || null,
                    message: metadata.message || null,
                    status: 'success',
                    createdAt: new Date(),
                    verifiedViaClient: true
                })

                // Update user's total earnings and supporter count
                const userRef = adminDb.collection('users').doc(metadata.toUserId)
                const { FieldValue } = await import('firebase-admin/firestore')

                // Calculate unique supporters
                const allPayments = await adminDb.collection('payments')
                    .where('toUserId', '==', metadata.toUserId)
                    .get()

                const uniqueSupporters = new Set()
                allPayments.forEach(doc => {
                    const data = doc.data()
                    // Count by email (for both logged-in and anonymous supporters)
                    if (data.fromEmail) {
                        uniqueSupporters.add(data.fromEmail)
                    }
                })

                await userRef.update({
                    totalEarnings: FieldValue.increment(amount / 100),
                    supporterCount: uniqueSupporters.size
                })

                // Update goal if applicable
                if (metadata.goalId) {
                    const goalRef = adminDb.collection('goals').doc(metadata.goalId)
                    await goalRef.update({
                        currentAmount: FieldValue.increment(amount / 100)
                    })
                }
            }

            return {
                status: 'success',
                data: response.data
            }
        }

        return { status: 'failed', message: response.data.gateway_response }

    } catch (error: any) {
        console.error('Verify error:', error)
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
