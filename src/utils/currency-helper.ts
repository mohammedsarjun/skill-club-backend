import { SupportedCurrency } from '../contants/currency.constants';

export const getCurrencySymbol = (currency?: string): string => {
  if (!currency) return '₹';
  
  const currencyMap: Record<SupportedCurrency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    JPY: '¥',
  };

  return currencyMap[currency as SupportedCurrency] || '₹';
};
