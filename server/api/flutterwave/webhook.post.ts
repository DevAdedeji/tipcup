import { verifyTransaction } from '../../utils/flutterwave'
import { adminDb, FieldValue } from '../../utils/admin'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const headers = getHeaders(event)
        const signature = headers['verif-hash']

        if (!process.env.FLUTTERWAVE_SECRET_HASH || signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
            throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
        }

        const { event: eventType, data } = body

        if (eventType === 'charge.completed' && data.status === 'successful') {
            const verification = await verifyTransaction(data.id)

            if (verification.status === 'success' && verification.data.amount >= data.amount) {
                const reference = data.tx_ref

                const paymentsRef = adminDb.collection('payments')
                const querySnapshot = await paymentsRef.where('reference', '==', reference).limit(1).get()

                if (!querySnapshot.empty) {
                    const paymentDoc = querySnapshot.docs[0]
                    if (paymentDoc && paymentDoc.exists && paymentDoc.data().status !== 'success') {
                        await paymentDoc.ref.update({
                            status: 'success',
                            updatedAt: FieldValue.serverTimestamp(),
                            gateway_response: data
                        })

                        const userId = paymentDoc.data().toUserId
                        if (userId) {
                            const userRef = adminDb.collection('users').doc(userId)
                            await userRef.update({
                                currentBalance: FieldValue.increment(data.amount),
                                totalEarnings: FieldValue.increment(data.amount)
                            })
                        }
                    }
                }
            }
        }

        return { status: 'success' }

    } catch (error: any) {
        return { status: 'error' }
    }
})
