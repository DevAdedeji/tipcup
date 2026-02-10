import { createTransferRecipient } from '../../utils/paystack'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name, account_number, bank_code } = body

    if (!name || !account_number || !bank_code) {
        throw createError({ statusCode: 400, statusMessage: 'Name, Account Number and Bank Code are required' })
    }

    try {
        const response: any = await createTransferRecipient(name, account_number, bank_code)
        if (response.data) {
            return { status: 'success', data: response.data }
        }
        return { status: 'failed', message: 'Could not create recipient' }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
