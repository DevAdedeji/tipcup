import { verifyTransaction } from '../../utils/flutterwave'
import { adminDb, FieldValue, Timestamp } from '../../utils/admin'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { transaction_id } = body

        if (!transaction_id) {
            throw createError({ statusCode: 400, statusMessage: 'Transaction ID is required' })
        }

        const response = await verifyTransaction(transaction_id)

        if (response.status === 'success' && response.data.status === 'successful') {
            const txData = response.data
            const reference = txData.tx_ref

            // Create or update payment record in Firestore
            const paymentsRef = adminDb.collection('payments')
            const querySnapshot = await paymentsRef.where('reference', '==', reference).limit(1).get()

            let paymentDocRef

            if (!querySnapshot.empty) {
                // Update existing payment
                const paymentDoc = querySnapshot.docs[0]
                if (!paymentDoc) {
                    throw new Error('Payment document not found')
                }

                paymentDocRef = paymentDoc.ref

                if (paymentDoc.exists && paymentDoc.data().status !== 'success') {
                    await paymentDoc.ref.update({
                        status: 'success',
                        updatedAt: FieldValue.serverTimestamp(),
                        transaction_id: txData.id,
                        gateway_response: txData
                    })

                    const userId = paymentDoc.data().toUserId
                    if (userId) {
                        const userRef = adminDb.collection('users').doc(userId)
                        await userRef.update({
                            currentBalance: FieldValue.increment(txData.amount),
                            totalEarnings: FieldValue.increment(txData.amount)
                        })
                    }
                }
            } else {
                // Create new payment record
                const metadata = txData.meta || {}
                paymentDocRef = await paymentsRef.add({
                    reference: reference,
                    transaction_id: txData.id,
                    amount: txData.amount,
                    currency: txData.currency,
                    status: 'success',
                    gateway: 'flutterwave',
                    toUserId: metadata.toUserId || null,
                    fromUserId: metadata.fromUserId || null,
                    fromName: metadata.fromName || 'Anonymous',
                    goalId: metadata.goalId || null,
                    tier: metadata.tier || null,
                    message: metadata.message || '',
                    email: txData.customer?.email || null,
                    createdAt: Timestamp.now(),
                    updatedAt: FieldValue.serverTimestamp(),
                    gateway_response: txData
                })

                // Update user balance
                if (metadata.toUserId) {
                    const userRef = adminDb.collection('users').doc(metadata.toUserId)
                    await userRef.update({
                        currentBalance: FieldValue.increment(txData.amount),
                        totalEarnings: FieldValue.increment(txData.amount)
                    })
                }
            }

            return {
                status: 'success',
                data: response.data,
                payment_id: paymentDocRef.id
            }
        }

        return { status: 'failed', message: 'Verification failed' }

    } catch (error: any) {
        console.error('Verify transaction error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to verify transaction'
        })
    }
})
