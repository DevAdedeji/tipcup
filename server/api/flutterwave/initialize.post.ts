import { initializePayment } from '../../utils/flutterwave'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { email, amount, metadata, callback_url } = body

        if (!email || !amount) {
            throw createError({ statusCode: 400, statusMessage: 'Email and amount are required' })
        }

        // Generate unique reference
        const reference = `tipcup-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        // Add default callback if not provided (though frontend usually handles this via redirect)
        const redirect_url = callback_url || process.env.VITE_APP_URL + '/payment/callback'

        const response = await initializePayment(email, amount, reference, redirect_url, metadata)

        if (response.status === 'success') {
            return {
                authorization_url: response.data.link,
                reference: reference, // Return our reference
                access_code: 'FLW-Does-Not-Use-Access-Code-Same-Way' // Placeholder if frontend expects structure
            }
        }

        throw createError({
            statusCode: 400,
            statusMessage: 'Payment initialization failed'
        })

    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to initialize payment'
        })
    }
})
