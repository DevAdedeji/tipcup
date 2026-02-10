import { initializeTransaction } from '../../utils/paystack'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, amount, callback_url, metadata } = body

    if (!email || !amount) {
        throw createError({ statusCode: 400, statusMessage: 'Email and Amount are required' })
    }

    try {
        const response: any = await initializeTransaction(email, amount, metadata, callback_url)
        return response.data
    } catch (error: any) {
        throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message })
    }
})
