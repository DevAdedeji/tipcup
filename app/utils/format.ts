// Bachs rejects NGN checkouts below this.
export const MIN_TIP_AMOUNT = 1000

export const MIN_WITHDRAWAL_AMOUNT = 1000

export const DEFAULT_TIER_AMOUNT = 1000

export function formatCurrency(amount: number, decimals: number = 0): string {
    const value = Number.isFinite(amount) ? amount : 0
    return (
        '₦' +
        value.toLocaleString('en-NG', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        })
    )
}

export function formatCompactCurrency(amount: number): string {
    const value = Number.isFinite(amount) ? amount : 0
    const abs = Math.abs(value)

    if (abs >= 1_000_000_000) return `₦${trimZero(value / 1_000_000_000)}B`
    if (abs >= 1_000_000) return `₦${trimZero(value / 1_000_000)}M`
    if (abs >= 1_000) return `₦${trimZero(value / 1_000)}k`

    return formatCurrency(value)
}

const trimZero = (value: number): string => {
    const rounded = Math.round(value * 10) / 10
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function validateAmount(
    amount: number | string,
    minimum: number = MIN_TIP_AMOUNT
): string | null {
    const value = typeof amount === 'number' ? amount : Number(amount)

    if (!Number.isFinite(value) || value <= 0) return 'Enter an amount'
    if (value < minimum) return `Minimum is ${formatCurrency(minimum)}`

    return null
}
