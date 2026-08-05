import { createWithdrawal, DEFAULT_CURRENCY } from '../../utils/bachs'
import { adminDb, FieldValue, Timestamp } from '../../utils/admin'
import { requireUser } from '../../utils/auth'

const MINIMUM_WITHDRAWAL = 1000

export default defineEventHandler(async (event) => {
    const { uid, email } = await requireUser(event)

    const body = await readBody(event)
    const { amount, bankAccountId } = body || {}

    const numericAmount = Number(amount)

    if (!bankAccountId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Amount and bank account are required' })
    }

    if (numericAmount < MINIMUM_WITHDRAWAL) {
        throw createError({
            statusCode: 400,
            statusMessage: `Minimum withdrawal is ₦${MINIMUM_WITHDRAWAL.toLocaleString()}`,
        })
    }

    const userRef = adminDb.collection('users').doc(uid)
    const bankRef = userRef.collection('bank_accounts').doc(bankAccountId)
    const reference = `payout_${Date.now()}_${uid.slice(0, 8)}`
    const withdrawalRef = adminDb.collection('withdrawals').doc(reference)

    const destination = await adminDb.runTransaction(async (t) => {
        const [userDoc, bankDoc] = await Promise.all([t.get(userRef), t.get(bankRef)])

        if (!userDoc.exists) throw createError({ statusCode: 404, statusMessage: 'User not found' })
        if (!bankDoc.exists) throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })

        const balance = userDoc.data()?.currentBalance || 0
        if (balance < numericAmount) {
            throw createError({ statusCode: 400, statusMessage: 'Insufficient balance' })
        }

        const bank = bankDoc.data() || {}
        if (!bank.accountNumber || !bank.bank_code) {
            throw createError({ statusCode: 400, statusMessage: 'This bank account is missing payout details' })
        }

        t.update(userRef, { currentBalance: FieldValue.increment(-numericAmount) })

        t.set(withdrawalRef, {
            userId: uid,
            amount: numericAmount,
            currency: DEFAULT_CURRENCY,
            status: 'pending',
            reference,
            gateway: 'bachs',
            bank_name: bank.bankName || 'Unknown Bank',
            account_number: bank.accountNumber,
            account_name: bank.accountName || null,
            createdAt: Timestamp.now(),
            updatedAt: FieldValue.serverTimestamp(),
        })

        return {
            accountNumber: bank.accountNumber as string,
            bankCode: bank.bank_code as string,
            email: (userDoc.data()?.email as string) || email,
        }
    })

    try {
        const payout = await createWithdrawal({
            amount: numericAmount,
            currency: DEFAULT_CURRENCY,
            accountNumber: destination.accountNumber,
            bankCode: destination.bankCode,
            reference,
            email: destination.email || 'payouts@tipcup.app',
            description: 'TipCup creator payout',
            metadata: { userId: uid },
        })

        await withdrawalRef.update({
            withdrawal_id: payout.withdrawal_id,
            provider_reference: payout.provider_reference || null,
            providerStatus: payout.status,
            updatedAt: FieldValue.serverTimestamp(),
        })

        return {
            status: 'success',
            message: 'Withdrawal initiated',
            reference,
            withdrawal_id: payout.withdrawal_id,
        }
    } catch (error: any) {
        console.error('Bachs withdrawal failed:', error?.statusMessage || error?.message)

        await adminDb.runTransaction(async (t) => {
            const doc = await t.get(withdrawalRef)
            if (!doc.exists || doc.data()?.status !== 'pending') return

            t.update(withdrawalRef, {
                status: 'failed',
                failureReason: error?.statusMessage || error?.message || 'Payout request rejected',
                updatedAt: FieldValue.serverTimestamp(),
            })
            t.update(userRef, { currentBalance: FieldValue.increment(numericAmount) })
        })

        throw createError({
            statusCode: 502,
            statusMessage: error?.statusMessage || 'Withdrawal failed. Your balance has been restored.',
        })
    }
})
