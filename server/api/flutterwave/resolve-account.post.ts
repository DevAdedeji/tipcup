import { resolveBankAccount } from '../../utils/flutterwave'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { account_number, bank_code } = body

        if (!account_number || !bank_code) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Account number and bank code are required'
            })
        }

        const response = await resolveBankAccount(account_number, bank_code)

        if (response.status === 'success') {
            return {
                status: 'success',
                data: {
                    account_name: response.data.account_name,
                    account_number: response.data.account_number
                }
            }
        }

        throw createError({
            statusCode: 400,
            statusMessage: response.message || 'Could not resolve account'
        })
    } catch (error: any) {
        console.error('Resolve account error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Could not resolve account. Please check details.'
        })
    }
})
