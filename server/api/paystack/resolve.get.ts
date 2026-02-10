import { resolveBankAccount } from '../../utils/paystack'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { account_number, bank_code } = query

    if (!account_number || !bank_code) {
        throw createError({ statusCode: 400, statusMessage: 'Account number and bank code are required' })
    }

    try {
        const response: any = await resolveBankAccount(String(account_number), String(bank_code))
        if (response.data) {
            return { status: 'success', data: response.data }
        }
        return { status: 'failed', message: 'Could not resolve account' }
    } catch (error: any) {
        // Propagate the actual error from the utility
        throw error
    }
})
