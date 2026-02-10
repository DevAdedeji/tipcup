
const PAYSTACK_SECRET_KEY = process.env.VITE_PAYSTACK_SECRET_KEY
const PAYSTACK_API_URL = 'https://api.paystack.co'

const headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
}

export const initializeTransaction = async (email: string, amount: number, metadata: any, callback_url?: string) => {
    try {
        const response: any = await $fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
            method: 'POST',
            headers,
            body: {
                email,
                amount: amount * 100,
                currency: 'NGN',
                metadata,
                callback_url
            }
        })
        return response
    } catch (error: any) {
        console.error('Paystack Initialize Error:', error)
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: error.response?._data?.message || 'Failed to initialize payment'
        })
    }
}

export const verifyTransaction = async (reference: string) => {
    try {
        const response: any = await $fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
            method: 'GET',
            headers
        })
        return response
    } catch (error: any) {
        console.error('Paystack Verify Error:', error)
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: error.response?._data?.message || 'Failed to verify payment'
        })
    }
}

export const createTransferRecipient = async (name: string, account_number: string, bank_code: string) => {
    try {
        const response: any = await $fetch(`${PAYSTACK_API_URL}/transferrecipient`, {
            method: 'POST',
            headers,
            body: {
                type: 'nuban',
                name,
                account_number,
                bank_code,
                currency: 'NGN'
            }
        })
        return response
    } catch (error: any) {
        console.error('Paystack Create Recipient Error:', error)
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: error.response?._data?.message || 'Failed to create transfer recipient'
        })
    }
}

export const resolveBankAccount = async (account_number: string, bank_code: string) => {
    try {
        const response: any = await $fetch(`${PAYSTACK_API_URL}/bank/resolve`, {
            method: 'GET',
            headers,
            params: {
                account_number,
                bank_code
            }
        })
        return response
    } catch (error: any) {
        // Paystack returns 422 for invalid account, catch and rethrow gracefully
        console.error('Paystack Resolve Bank Error:', error)
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: 'Could not resolve account. Please check details.'
        })
    }
}
