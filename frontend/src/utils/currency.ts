import { SupportedLanguage } from '../i18n/types';

/**
 * Locale-aware price formatting for EUR (€)
 * English: €22.00
 * French: 22,00 €
 * Arabic: 22.00 € (or €22.00)
 */
export function formatPrice(amount: number | string | undefined | null, language: SupportedLanguage = 'en'): string {
  if (amount === undefined || amount === null) return '';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num)) return String(amount);

  if (language === 'fr') {
    return `${num.toFixed(2).replace('.', ',')} €`;
  }

  if (language === 'ar') {
    return `${num.toFixed(2)} €`;
  }

  return `€${num.toFixed(2)}`;
}
