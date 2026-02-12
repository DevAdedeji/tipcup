const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY
const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3'

if (!FLUTTERWAVE_SECRET_KEY) {
    throw new Error('FLUTTERWAVE_SECRET_KEY is not defined')
}

const headers = {
    Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    'Content-Type': 'application/json'
}

export const initializePayment = async (email: string, amount: number, reference: string, callback_url?: string, meta?: any) => {
    try {
        const response: any = await $fetch(`${FLUTTERWAVE_API_URL}/payments`, {
            method: 'POST',
            headers,
            body: {
                tx_ref: reference,
                amount,
                currency: 'NGN',
                redirect_url: callback_url,
                customer: {
                    email,
                },
                meta
            }
        })
        return response
    } catch (error: any) {
        console.error('Flutterwave Initialize Error:', error)
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: error.response?._data?.message || 'Failed to initialize payment'
        })
    }
}

export const verifyTransaction = async (transactionId: string) => {
    try {
        const response: any = await $fetch(`${FLUTTERWAVE_API_URL}/transactions/${transactionId}/verify`, {
            method: 'GET',
            headers
        })
        return response
    } catch (error: any) {
        console.error('Flutterwave Verify Error:', error)
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: error.response?._data?.message || 'Failed to verify payment'
        })
    }
}

export const getBanks = async (country: string = 'NG') => {
    try {
        const response: any = await $fetch(`${FLUTTERWAVE_API_URL}/banks/${country}`, {
            method: 'GET',
            headers
        })
        return response
    } catch (error: any) {
        console.error('Flutterwave Get Banks Error:', error)
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: 'Failed to fetch banks'
        })
    }
}

export const resolveBankAccount = async (account_number: string, account_bank: string) => {
    try {
        console.log('Calling Flutterwave resolve with:', { account_number, account_bank })
        const response: any = await $fetch(`${FLUTTERWAVE_API_URL}/accounts/resolve`, {
            method: 'POST',
            headers,
            body: {
                account_number,
                account_bank
            }
        })
        console.log('Flutterwave raw response:', response)
        return response
    } catch (error: any) {
        console.error('Flutterwave Resolve Account Error:', error)
        console.error('Error data:', error.data)
        console.error('Error response:', error.response)

        let errorMessage = 'Could not resolve account. Please check details.'

        // Check for test environment restriction
        if (error.data?.message?.includes('only 044 is allowed')) {
            errorMessage = 'Test mode: Only Access Bank (044) is supported. Use production keys for all banks, or select Access Bank for testing.'
        } else if (error.data?.message) {
            errorMessage = error.data.message
        }

        throw createError({
            statusCode: error.response?.status || error.statusCode || 400,
            statusMessage: errorMessage
        })
    }
}

export const initiateTransfer = async (amount: number, bank_code: string, account_number: string, narration?: string, reference?: string) => {
    try {
        const response: any = await $fetch(`${FLUTTERWAVE_API_URL}/transfers`, {
            method: 'POST',
            headers,
            body: {
                account_bank: bank_code,
                account_number: account_number,
                amount,
                narration,
                currency: 'NGN',
                reference,
                debit_currency: 'NGN'
            }
        })
        return response
    } catch (error: any) {
        console.error('Flutterwave Transfer Error:', error)
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: error.response?._data?.message || 'Failed to initiate transfer'
        })
    }
}
