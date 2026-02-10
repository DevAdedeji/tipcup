/**
 * Format large numbers with k/M/B suffixes
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "500k", "5.2M")
 */
export function formatNumber(num: number, decimals: number = 1): string {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(decimals).replace(/\.0$/, '') + 'B'
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(decimals).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(decimals).replace(/\.0$/, '') + 'k'
    }
    return num.toLocaleString()
}

/**
 * Format currency with Naira symbol and number formatting
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted currency string (e.g., "₦500k", "₦5.2M")
 */
export function formatCurrency(amount: number, decimals: number = 1): string {
    return '₦' + formatNumber(amount, decimals)
}
