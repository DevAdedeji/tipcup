import { getCheckoutSession, isCheckoutPaid } from '../../utils/bachs'
import { recordSuccessfulCollection } from '../../utils/payments'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const checkoutId = body?.checkout_id

    if (!checkoutId || typeof checkoutId !== 'string') {
        throw createError({ statusCode: 400, statusMessage: 'checkout_id is required' })
    }

    const session = await getCheckoutSession(checkoutId)

    if (!isCheckoutPaid(session)) {
        return {
            status: 'pending',
            checkout_status: session.status,
            payment_status: session.payment_status ?? null,
        }
    }

    const charge = session.charge || {}

    const result = await recordSuccessfulCollection({
        reference: session.reference || charge.reference || checkoutId,
        charge_id: charge.charge_id || charge.id || null,
        checkout_id: session.checkout_id,
        amount: charge.amount ?? session.amount,
        settlement_amount: charge.settlement_amount ?? null,
        currency: charge.currency || session.currency,
        processing_fee: charge.processing_fee ?? null,
        payment_method: charge.payment_method ?? null,
        customer: charge.customer ?? null,
        metadata: (session.metadata || charge.metadata || {}) as Record<string, any>,
    })

    return {
        status: 'success',
        already_processed: result.status === 'already_processed',
        payment_id: result.paymentId,
        amount: result.amount,
    }
})
