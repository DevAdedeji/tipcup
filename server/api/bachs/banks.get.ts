import { listBanks } from '../../utils/bachs'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const country = (query.country as string) || 'NG'

    const banks = await listBanks(country)

    return {
        status: 'success',
        message: 'Banks fetched successfully',
        data: banks
            .map((bank) => ({
                code: bank.code,
                name: bank.name,
                slug: bank.slug,
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
    }
})
