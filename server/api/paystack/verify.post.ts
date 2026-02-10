import { verifyTransaction } from '../../utils/paystack'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { reference } = body

    if (!reference) {
        throw createError({ statusCode: 400, statusMessage: 'Reference is required' })
    }

    try {
        const response: any = await verifyTransaction(reference)

        if (response.data.status === 'success') {
            return {
                status: 'success',
                data: response.data
            }
        }

        return { status: 'failed', message: response.data.gateway_response }

    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
