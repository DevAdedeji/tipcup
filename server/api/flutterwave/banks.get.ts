import { getBanks } from '../../utils/flutterwave'

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const country = query.country as string || 'NG'

        const response = await getBanks(country)

        if (response.status === 'success') {
            return response.data.map((bank: any) => ({
                id: bank.id,
                code: bank.code,
                name: bank.name
            })).sort((a: any, b: any) => a.name.localeCompare(b.name))
        }

        return []
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to fetch banks'
        })
    }
})
