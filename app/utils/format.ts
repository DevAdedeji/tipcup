/**
 * Format currency with Naira symbol and number formatting
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted currency string (e.g., "₦500k", "₦5.2M")
 */
export function formatCurrency(amount: number, decimals: number = 1): string {
    return '₦' + amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
