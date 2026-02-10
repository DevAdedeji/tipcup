
import crypto from 'crypto'
import { adminDb } from '../../utils/admin'

const PAYSTACK_SECRET_KEY = process.env.VITE_PAYSTACK_SECRET_KEY

export default defineEventHandler(async (event) => {
    // Only allow POST
    if (event.node.req.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }

    const body = await readBody(event)
    const signature = event.node.req.headers['x-paystack-signature'] as string

    // 1. Verify Signature
    if (!PAYSTACK_SECRET_KEY) {
        console.error('Webhook Error: NUXT_PAYSTACK_SECRET_KEY is missing')
        throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error' })
    }

    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(body))
        .digest('hex')

    if (hash !== signature) {
        console.error('Webhook Error: Invalid Signature')
        throw createError({ statusCode: 400, statusMessage: 'Invalid Signature' })
    }

    // 2. Handle Events
    try {
        if (body.event === 'charge.success') {
            const { reference, metadata, amount, customer, status } = body.data

            // Check for duplicate processing
            const paymentRef = adminDb.collection('payments').where('reference', '==', reference).limit(1)
            const snapshot = await paymentRef.get()

            if (!snapshot.empty) {
                console.log('Payment already processed:', reference)
                return { status: 'success' }
            }

            // Create Payment Record
            await adminDb.collection('payments').add({
                reference,
                amount: amount / 100,
                fromEmail: customer.email,
                toUserId: metadata.toUserId,
                goalId: metadata.goalId || null,
                tier: metadata.tier || null,
                status: 'success',
                createdAt: new Date(),
                verifiedViaWebhook: true
            })

            // Update Goal Progress (if applicable)
            if (metadata.goalId) {
                const goalRef = adminDb.collection('goals').doc(metadata.goalId)
                // Use field value increment for atomic update
                const { FieldValue } = await import('firebase-admin/firestore')
                await goalRef.update({
                    currentAmount: FieldValue.increment(amount / 100)
                })
            }

            console.log('Webhook: Charge processed successfully', reference)

        } else if (body.event === 'transfer.success') {
            // Handle successful transfer (payout)
            console.log('Webhook: Transfer successful', body.data.reference)
            // Logic to update payout status in db would go here
        }
    } catch (error) {
        console.error('Webhook Processing Error:', error)
        return { status: 'error', message: 'Internal Server Error' }
    }

    // Acknowledge receipt
    return { status: 'success' }
})
