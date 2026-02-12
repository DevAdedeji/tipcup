import { initiateTransfer } from '../../utils/flutterwave'
import { adminDb, FieldValue } from '../../utils/admin'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { amount, bankAccountId, userId } = body

        if (!userId || !amount || !bankAccountId) {
            throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
        }

        const userRef = adminDb.collection('users').doc(userId)
        const bankRef = userRef.collection('bank_accounts').doc(bankAccountId)

        let transferData: any = null;

        await adminDb.runTransaction(async (t) => {
            const userDoc = await t.get(userRef)
            if (!userDoc.exists) throw new Error('User not found')

            const bankDoc = await t.get(bankRef)
            if (!bankDoc.exists) throw new Error('Bank account not found')

            const userData = userDoc.data()
            const currentBalance = userData?.currentBalance || 0

            if (currentBalance < amount) {
                throw new Error('Insufficient funds')
            }

            t.update(userRef, { currentBalance: currentBalance - amount })

            const bankData = bankDoc.data()
            transferData = {
                account_number: bankData?.accountNumber,
                bank_code: bankData?.bank_code,
                account_name: bankData?.accountName,
                bank_name: bankData?.bankName || 'Unknown Bank'
            }
        })

        if (!transferData) {
            throw createError({ statusCode: 500, statusMessage: 'Transaction failed initialization' })
        }

        const reference = `withdraw-${Date.now()}-${userId}`

        try {
            const transfer = await initiateTransfer(amount, transferData.bank_code, transferData.account_number, 'Payout', reference)

            if (transfer.status === 'success') {
                await adminDb.collection('withdrawals').add({
                    userId,
                    amount,
                    status: 'pending',
                    reference,
                    flw_id: transfer.data.id || null,
                    bank_name: transferData.bank_name,
                    account_number: transferData.account_number,
                    createdAt: FieldValue.serverTimestamp()
                })

                return { status: 'success', message: 'Transfer initiated' }
            } else {
                throw new Error(transfer.message || 'Transfer failed at provider')
            }
        } catch (transferError: any) {
            console.error('Flutterwave Transfer Failed:', transferError)
            await userRef.update({ currentBalance: FieldValue.increment(amount) })
            throw createError({ statusCode: 502, statusMessage: 'Transfer failed. You have been refunded.' })
        }

    } catch (error: any) {
        console.error('Withdrawal Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusCode ? error.statusMessage : 'Withdrawal processing failed'
        })
    }
})
