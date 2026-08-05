import { resolveBankAccount } from '../../utils/bachs'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { account_number, bank_code } = body || {}

    if (!account_number || !bank_code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Account number and bank code are required',
        })
    }

    const account = await resolveBankAccount(String(account_number), String(bank_code))

    return {
        status: 'success',
        data: {
            account_name: account.account_name,
            account_number: account.account_number,
            bank_name: account.bank_name ?? null,
        },
    }
})
