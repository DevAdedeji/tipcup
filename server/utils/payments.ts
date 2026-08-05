import { adminDb, FieldValue, Timestamp } from './admin'
import { creditableAmount, fromDecimalString } from './bachs'

export interface CollectionData {
    reference?: string | null
    charge_id?: string | null
    checkout_id?: string | null
    amount?: string | number
    settlement_amount?: string | number | null
    currency?: string
    processing_fee?: string | number | null
    payment_method?: string | null
    customer?: { id?: string; email?: string; name?: string } | null
    metadata?: Record<string, any> | null
}

export interface CollectionResult {
    status: 'recorded' | 'already_processed' | 'ignored'
    paymentId?: string
    amount?: number
}

// The payment document id is the checkout reference, and every balance
// change runs in a transaction, so a redirect and a webhook arriving
// together cannot double-credit.
export const recordSuccessfulCollection = async (data: CollectionData): Promise<CollectionResult> => {
    const reference = data.reference
    if (!reference) {
        console.warn('Bachs collection without a reference; skipping', data.charge_id)
        return { status: 'ignored' }
    }

    const metadata = data.metadata || {}
    const toUserId: string | null = metadata.toUserId || null
    const goalId: string | null = metadata.goalId || null

    const amount = creditableAmount(data)
    const grossAmount = fromDecimalString(data.amount)

    const paymentRef = adminDb.collection('payments').doc(reference)

    return await adminDb.runTransaction(async (t) => {
        const existing = await t.get(paymentRef)

        if (existing.exists && existing.data()?.status === 'success') {
            return { status: 'already_processed' as const, paymentId: paymentRef.id }
        }

        t.set(
            paymentRef,
            {
                reference,
                charge_id: data.charge_id || null,
                checkout_id: data.checkout_id || null,
                amount,
                grossAmount,
                currency: data.currency || 'NGN',
                processingFee: fromDecimalString(data.processing_fee),
                paymentMethod: data.payment_method || null,
                status: 'success',
                gateway: 'bachs',
                toUserId,
                fromUserId: metadata.fromUserId || null,
                fromName: metadata.fromName || data.customer?.name || 'Anonymous',
                goalId,
                tier: metadata.tier || null,
                message: metadata.message || '',
                email: data.customer?.email || metadata.email || null,
                createdAt: existing.exists ? existing.data()?.createdAt || Timestamp.now() : Timestamp.now(),
                updatedAt: FieldValue.serverTimestamp(),
                gateway_response: data,
            },
            { merge: true }
        )

        if (toUserId && amount > 0) {
            t.update(adminDb.collection('users').doc(toUserId), {
                currentBalance: FieldValue.increment(amount),
                totalEarnings: FieldValue.increment(amount),
            })

            if (goalId) {
                t.update(adminDb.collection('users').doc(toUserId).collection('goals').doc(goalId), {
                    currentAmount: FieldValue.increment(amount),
                    updatedAt: FieldValue.serverTimestamp(),
                })
            }
        }

        return { status: 'recorded' as const, paymentId: paymentRef.id, amount }
    })
}

export interface PayoutData {
    reference?: string | null
    withdrawal_id?: string | null
    provider_reference?: string | null
    status?: string
    amount?: string | number
    withdrawal_fee?: string | number | null
}

export const recordPayoutResult = async (
    data: PayoutData,
    outcome: 'completed' | 'failed'
): Promise<'updated' | 'already_processed' | 'ignored'> => {
    const reference = data.reference
    if (!reference) return 'ignored'

    const withdrawalRef = adminDb.collection('withdrawals').doc(reference)

    return await adminDb.runTransaction(async (t) => {
        const doc = await t.get(withdrawalRef)
        if (!doc.exists) return 'ignored'

        const current = doc.data() || {}
        if (current.status === 'completed' || current.status === 'failed') {
            return 'already_processed'
        }

        t.update(withdrawalRef, {
            status: outcome,
            withdrawal_id: data.withdrawal_id || current.withdrawal_id || null,
            provider_reference: data.provider_reference || null,
            fee: fromDecimalString(data.withdrawal_fee),
            updatedAt: FieldValue.serverTimestamp(),
            completedAt: FieldValue.serverTimestamp(),
            gateway_response: data,
        })

        if (outcome === 'failed' && current.userId && current.amount) {
            t.update(adminDb.collection('users').doc(current.userId), {
                currentBalance: FieldValue.increment(current.amount),
            })
        }

        return 'updated'
    })
}

export const claimWebhookEvent = async (eventId: string): Promise<boolean> => {
    const ref = adminDb.collection('webhook_events').doc(eventId)

    return await adminDb.runTransaction(async (t) => {
        const doc = await t.get(ref)
        if (doc.exists) return false

        t.set(ref, { receivedAt: FieldValue.serverTimestamp() })
        return true
    })
}
