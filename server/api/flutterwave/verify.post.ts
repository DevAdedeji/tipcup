import { verifyTransaction } from '../../utils/flutterwave'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { transaction_id } = body

        if (!transaction_id) {
            throw createError({ statusCode: 400, statusMessage: 'Transaction ID is required' })
        }

        const response = await verifyTransaction(transaction_id)

        if (response.status === 'success') {
            return {
                status: 'success',
                data: response.data
            }
        }

        return { status: 'failed', message: 'Verification failed' }

    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to verify transaction'
        })
    }
})
