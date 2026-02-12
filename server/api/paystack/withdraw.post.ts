import { initiateTransfer } from '../../utils/paystack'
import { adminDb } from '../../utils/admin'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userId, amount, recipientCode } = body

    if (!userId || !amount || !recipientCode) {
        throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
    }

    // Minimum withdrawal amount check (Paystack minimum + margin)
    if (amount < 1000) {
        throw createError({ statusCode: 400, statusMessage: 'Minimum withdrawal amount is ₦1,000' })
    }

    try {
        const userRef = adminDb.collection('users').doc(userId)

        // 1. Check Balance & Deduct (Optimistic Update via Transaction)
        // We use a transaction to ensure we don't double-spend or withdraw more than available
        await adminDb.runTransaction(async (t) => {
            const userDoc = await t.get(userRef)

            if (!userDoc.exists) {
                throw new Error('User not found')
            }

            const userData = userDoc.data()
            const currentBalance = userData?.currentBalance || 0

            if (currentBalance < amount) {
                throw new Error('Insufficient funds')
            }

            // Deduct from balance
            t.update(userRef, {
                currentBalance: currentBalance - amount
            })
        })

        // 2. Create Manual Withdrawal Request (Starter Business Support)
        // Since Starter Businesses cannot use the Transfer API, we record the request for manual processing.

        await adminDb.collection('withdrawals').add({
            userId,
            amount,
            recipientCode,
            status: 'pending_manual_review', // Indicates manual action needed
            paystackTransferCode: null,
            reference: `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return {
            status: 'success',
            message: 'Withdrawal request submitted for processing. You will be notified once approved.',
            data: {
                amount,
                recipient_code: recipientCode
            }
        }

        /*
        // AUTOMATED PAYOUTS (Registered Business Only)
        // Uncomment this block if you upgrade your Paystack account to Registered Business
        try {
            const transferResponse: any = await initiateTransfer(
                amount,
                recipientCode,
                'TipCup Withdrawal'
            )

            if (transferResponse && transferResponse.status) {
                // 3. Record Withdrawal Transaction
                await adminDb.collection('withdrawals').add({
                    userId,
                    amount,
                    recipientCode,
                    paystackTransferCode: transferResponse.data.transfer_code,
                    status: 'pending', // Paystack processes transfers asynchronously
                    reference: transferResponse.data.reference,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })

                return {
                    status: 'success',
                    message: 'Withdrawal initiated successfully',
                    data: transferResponse.data
                }
            } else {
                 throw new Error('Transfer initiation failed')
            }

        } catch (transferError: any) {
            console.error('Paystack Transfer Failed:', transferError)

            // REFUND USER: If Paystack call fails, we must refund the deducted balance
            const { FieldValue } = await import('firebase-admin/firestore')
            await userRef.update({
                currentBalance: FieldValue.increment(amount)
            })

            throw createError({
                statusCode: 500,
                statusMessage: transferError.message || 'Withdrawal failed. Funds have been returned to your wallet.'
            })
        }
        */

    } catch (error: any) {
        console.error('Withdrawal Process Error:', error)
        throw createError({
            statusCode: 400,
            statusMessage: error.message || 'Withdrawal failed'
        })
    }
})
