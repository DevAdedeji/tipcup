import { createHmac, timingSafeEqual } from 'node:crypto'
import { ofetch } from 'ofetch'

const SANDBOX_API_URL = 'https://sandbox-api.bachs.io/v1'
const LIVE_API_URL = 'https://api.bachs.io/v1'

export const NGN_MINIMUM_AMOUNT = 1000

export const DEFAULT_CURRENCY = 'NGN'

// 'gross' credits the full amount paid and TipCup absorbs the Bachs fee;
// 'net' credits the settlement amount so the creator bears it.
const creditBasis = () => (process.env.BACHS_CREDIT_BASIS === 'gross' ? 'gross' : 'net')

const secretKey = () => {
    const key = process.env.BACHS_SECRET_KEY
    if (!key) {
        throw createError({ statusCode: 500, statusMessage: 'BACHS_SECRET_KEY is not configured' })
    }
    return key
}

const apiUrl = () => (secretKey().startsWith('sk_sandbox_') ? SANDBOX_API_URL : LIVE_API_URL)

export const isSandbox = () => (process.env.BACHS_SECRET_KEY || '').startsWith('sk_sandbox_')

export const toDecimalString = (amount: number): string => {
    if (!Number.isFinite(amount)) throw new Error(`Invalid amount: ${amount}`)
    return (Math.round(amount * 100) / 100).toFixed(2)
}

export const fromDecimalString = (amount: string | number | null | undefined): number => {
    if (amount === null || amount === undefined) return 0
    const parsed = typeof amount === 'number' ? amount : Number.parseFloat(amount)
    if (!Number.isFinite(parsed)) return 0
    return Math.round(parsed * 100) / 100
}

// settlement_amount is what actually lands in the TipCup balance. Crediting
// `amount` under customer_pays_fee credits the fee too, which TipCup never
// received, so creator balances drift above the money backing them.
export const creditableAmount = (data: {
    amount?: string | number
    settlement_amount?: string | number | null
}): number => {
    if (creditBasis() === 'gross') return fromDecimalString(data.amount)

    return data.settlement_amount != null
        ? fromDecimalString(data.settlement_amount)
        : fromDecimalString(data.amount)
}

interface BachsRequest {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: Record<string, unknown>
    query?: Record<string, string | number | undefined>
    idempotencyKey?: string
}

const bachsFetch = async <T = any>(path: string, options: BachsRequest = {}): Promise<T> => {
    const { method = 'GET', body, query, idempotencyKey } = options

    const headers: Record<string, string> = {
        Authorization: `Bearer ${secretKey()}`,
        'Content-Type': 'application/json',
    }

    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

    try {
        return await ofetch<T>(`${apiUrl()}${path}`, { method, headers, body, query })
    } catch (error: any) {
        const payload = error?.data ?? error?.response?._data

        // Bachs errors are { detail, error_code }, not { message }.
        const message =
            payload?.detail ||
            payload?.message ||
            payload?.error?.message ||
            (typeof payload?.error === 'string' ? payload.error : null) ||
            error?.message ||
            'Bachs request failed'

        console.error(
            `Bachs ${method} ${path} failed [${payload?.error_code || error?.response?.status || '?'}]:`,
            message
        )

        throw createError({
            statusCode: error?.response?.status || error?.statusCode || 502,
            statusMessage: typeof message === 'string' ? message : 'Bachs request failed',
            data: payload?.error_code ? { errorCode: payload.error_code } : undefined,
        })
    }
}

export interface CreateCheckoutInput {
    email: string
    name?: string
    amount: number
    currency?: string
    reference: string
    successUrl: string
    cancelUrl?: string
    metadata?: Record<string, unknown>
}

export interface CheckoutSession {
    checkout_id: string
    checkout_url: string
    status: 'OPEN' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
    payment_status?: string | null
    amount: string
    currency: string
    reference?: string | null
    metadata?: Record<string, unknown> | null
    charge?: Record<string, any> | null
}

export const createCheckoutSession = async (input: CreateCheckoutInput): Promise<CheckoutSession> => {
    const currency = input.currency || DEFAULT_CURRENCY

    if (currency === 'NGN' && input.amount < NGN_MINIMUM_AMOUNT) {
        throw createError({
            statusCode: 400,
            statusMessage: `Minimum tip is ₦${NGN_MINIMUM_AMOUNT.toLocaleString()}`,
        })
    }

    return await bachsFetch<CheckoutSession>('/checkout-sessions', {
        method: 'POST',
        idempotencyKey: input.reference,
        body: {
            pricing: {
                currency,
                amount: toDecimalString(input.amount),
                price_type: 'fixed',
            },
            customer: {
                email: input.email,
                name: input.name?.trim() || input.email.split('@')[0] || 'Supporter',
            },
            reference: input.reference,
            success_url: input.successUrl,
            ...(input.cancelUrl ? { cancel_url: input.cancelUrl } : {}),
            ...(input.metadata ? { metadata: input.metadata } : {}),
        },
    })
}

export const getCheckoutSession = async (checkoutId: string): Promise<CheckoutSession> =>
    await bachsFetch<CheckoutSession>(`/checkout-sessions/${encodeURIComponent(checkoutId)}`)

export const getPayment = async (paymentId: string) =>
    await bachsFetch(`/payments/${encodeURIComponent(paymentId)}`)

export const isCheckoutPaid = (session: CheckoutSession): boolean =>
    session.status === 'COMPLETED' && (!session.payment_status || session.payment_status === 'succeeded')

export interface Bank {
    name: string
    code: string
    slug?: string
    nibss_bank_code?: string | null
    country?: string
}

interface BachsListResponse<T> {
    status: boolean
    message: string
    data: T | null
    error?: string | null
}

// The live API returns { banks: [...] }, not the { status, data } envelope
// its OpenAPI spec documents. Accept either.
export const listBanks = async (countryCode = 'NG'): Promise<Bank[]> => {
    const response = await bachsFetch<BachsListResponse<Bank[]> & { banks?: Bank[] }>(
        '/payouts/banks',
        { query: { country_code: countryCode } }
    )

    const banks = Array.isArray(response)
        ? (response as Bank[])
        : response?.banks || response?.data

    if (!Array.isArray(banks)) {
        throw createError({
            statusCode: 502,
            statusMessage: response?.error || response?.message || 'Failed to fetch banks',
        })
    }

    return banks
}

export interface ResolvedAccount {
    account_number: string
    account_name: string
    bank_code?: string
    bank_name?: string
}

export const resolveBankAccount = async (
    accountNumber: string,
    bankCode: string
): Promise<ResolvedAccount> => {
    const response = await bachsFetch<BachsListResponse<ResolvedAccount>>('/payouts/resolve-account', {
        method: 'POST',
        body: { account_number: accountNumber, bank_code: bankCode },
    })

    if (!response.status || !response.data) {
        throw createError({
            statusCode: 400,
            statusMessage:
                response.error || response.message || 'Could not resolve account. Please check the details.',
        })
    }

    return response.data
}

export interface CreateWithdrawalInput {
    amount: number
    currency?: string
    accountNumber: string
    bankCode: string
    reference: string
    email: string
    description?: string
    metadata?: Record<string, unknown>
}

export interface WithdrawalResult {
    withdrawal_id: string
    status: string
    provider_reference?: string | null
}

export const createWithdrawal = async (input: CreateWithdrawalInput): Promise<WithdrawalResult> => {
    const currency = input.currency || DEFAULT_CURRENCY

    return await bachsFetch<WithdrawalResult>('/payouts/withdrawals', {
        method: 'POST',
        idempotencyKey: input.reference,
        body: {
            from_currency: currency,
            to_currency: currency,
            amount: toDecimalString(input.amount),
            payment_method: 'BANK_TRANSFER',
            account_number: input.accountNumber,
            bank_code: input.bankCode,
            reference: input.reference,
            email: input.email,
            idempotency_key: input.reference,
            ...(input.description ? { description: input.description } : {}),
            ...(input.metadata ? { metadata: input.metadata } : {}),
        },
    })
}

export const getPayout = async (withdrawalId: string) =>
    await bachsFetch(`/payouts/${encodeURIComponent(withdrawalId)}`)

export const getBalances = async () => await bachsFetch('/accounts/balances')

const SIGNATURE_TOLERANCE_SECONDS = 300

export const verifyWebhookSignature = (
    rawBody: string,
    timestampHeader: string | undefined,
    signatureHeader: string | undefined
): boolean => {
    const secret = process.env.BACHS_WEBHOOK_SECRET
    if (!secret || !timestampHeader || !signatureHeader) return false

    const timestamp = Number.parseInt(timestampHeader, 10)
    if (!Number.isFinite(timestamp)) return false

    if (Math.abs(Date.now() / 1000 - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false

    const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex')

    const expectedBuffer = Buffer.from(expected, 'utf8')
    const providedBuffer = Buffer.from(signatureHeader, 'utf8')

    if (expectedBuffer.length !== providedBuffer.length) return false

    return timingSafeEqual(expectedBuffer, providedBuffer)
}

export interface BachsWebhookEvent<T = any> {
    id: string
    type: string
    created_at: string
    organization_id: string
    data: T
}
