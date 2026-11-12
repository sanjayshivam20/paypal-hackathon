/**
 * ImpactPulse AI — Frontend Multi-Currency Helper Utilities
 * Formats and maps PayPal-supported ISO 4217 international currencies.
 */

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  INR: '₹',
  SGD: 'S$',
  CHF: 'CHF',
  BRL: 'R$',
  MXN: 'Mex$',
  HKD: 'HK$',
  NZD: 'NZ$',
  SEK: 'kr',
  PHP: '₱',
}

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', decimals: 2 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimals: 2 },
]

export function getCurrencySymbol(code = 'USD') {
  return CURRENCY_SYMBOLS[code?.toUpperCase()] || '$'
}

export function formatCurrency(amount = 0, code = 'USD') {
  const curr = code?.toUpperCase() || 'USD'
  const symbol = getCurrencySymbol(curr)
  const num = Number(amount) || 0
  const decimals = curr === 'JPY' ? 0 : 2
  return `${symbol}${num.toFixed(decimals)} ${curr}`
}
