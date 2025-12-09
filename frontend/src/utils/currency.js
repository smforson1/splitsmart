/**
 * Format an amount according to the group's currency.
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The ISO currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns {string} Formatted string
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        // Fallback if currency code is invalid
        return `$${Number(amount).toFixed(2)}`;
    }
};

export const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];
