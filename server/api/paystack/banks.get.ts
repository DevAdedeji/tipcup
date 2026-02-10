
const PAYSTACK_SECRET_KEY = process.env.VITE_PAYSTACK_SECRET_KEY
const headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
}

export default defineEventHandler(async (event) => {
    try {
        const response: any = await $fetch('https://api.paystack.co/bank', {
            method: 'GET',
            headers
        })
        if (response.data) {
            return { status: 'success', data: response.data }
        }
        return { status: 'failed', message: 'Could not fetch banks' }
    } catch (error: any) {
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: error.response?._data?.message || 'Failed to fetch banks'
        })
    }
})
