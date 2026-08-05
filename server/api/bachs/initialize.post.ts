import { createCheckoutSession, NGN_MINIMUM_AMOUNT, DEFAULT_CURRENCY } from '../../utils/bachs'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, name, amount, metadata, successUrl, cancelUrl } = body || {}

    if (!email || typeof email !== 'string') {
        throw createError({ statusCode: 400, statusMessage: 'A valid email is required' })
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'A valid amount is required' })
    }

    if (numericAmount < NGN_MINIMUM_AMOUNT) {
        throw createError({
            statusCode: 400,
            statusMessage: `Minimum tip is ₦${NGN_MINIMUM_AMOUNT.toLocaleString()}`,
        })
    }

    if (!successUrl) {
        throw createError({ statusCode: 400, statusMessage: 'successUrl is required' })
    }

    const reference = `tip_${Date.now()}_${Math.floor(Math.random() * 1e6)}`

    const session = await createCheckoutSession({
        email,
        name,
        amount: numericAmount,
        currency: DEFAULT_CURRENCY,
        reference,
        successUrl,
        cancelUrl,
        metadata: {
            ...(metadata || {}),
            email,
        },
    })

    return {
        checkout_url: session.checkout_url,
        checkout_id: session.checkout_id,
        reference,
    }
})
