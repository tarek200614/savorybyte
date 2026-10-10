import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupportedLanguage, Direction, TranslationDictionary, DishTranslation } from './types';
import { en } from './locales/en';
import { fr } from './locales/fr';
import { ar } from './locales/ar';
import { formatPrice as formatPriceUtil } from '../utils/currency';

const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  fr,
  ar,
};

const STORAGE_KEY = 'savorybyte_language';

interface LanguageContextValue {
  language: SupportedLanguage;
  direction: Direction;
  isRTL: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  getDish: (originalName: string, fallbackDesc?: string | null) => DishTranslation;
  resolveLocation: (key: string) => { name: string; subtitle: string; ambience: string };
  resolveReservationStatus: (status: string) => string;
  resolveOrderStatus: (status: string) => string;
  resolveCategory: (slugOrName: string) => string;
  formatPrice: (amount: number | string | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved && ['en', 'fr', 'ar'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore storage access errors
    }
    return 'en';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore storage write errors
    }
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    if (isRTL) {
      document.documentElement.classList.add('rtl-mode');
    } else {
      document.documentElement.classList.remove('rtl-mode');
    }
  }, [language, direction, isRTL]);

  const setLanguage = (lang: SupportedLanguage) => {
    if (['en', 'fr', 'ar'].includes(lang)) {
      setLanguageState(lang);
    }
  };

  const currentT = translations[language] || en;

  const getDish = (originalName: string, fallbackDesc?: string | null): DishTranslation => {
    const dishEntry = currentT.dishes?.[originalName] || en.dishes?.[originalName];
    if (dishEntry) {
      return dishEntry;
    }
    return {
      name: originalName,
      description: fallbackDesc || '',
    };
  };

  const resolveLocation = (key: string) => {
    const upperKey = (key || '').toUpperCase() as keyof typeof en.enums.locations;
    const name = currentT.enums.locations[upperKey] || en.enums.locations[upperKey] || key;
    const subtitle = currentT.enums.locationSubtitles[upperKey] || en.enums.locationSubtitles[upperKey] || '';
    const ambience = currentT.enums.locationAmbiences[upperKey] || en.enums.locationAmbiences[upperKey] || '';
    return { name, subtitle, ambience };
  };

  const resolveReservationStatus = (status: string): string => {
    const upper = (status || '').toUpperCase() as keyof typeof en.enums.reservationStatuses;
    return currentT.enums.reservationStatuses[upper] || en.enums.reservationStatuses[upper] || status;
  };

  const resolveOrderStatus = (status: string): string => {
    const upper = (status || '').toUpperCase() as keyof typeof en.enums.orderStatuses;
    return currentT.enums.orderStatuses[upper] || en.enums.orderStatuses[upper] || status;
  };

  const resolveCategory = (slugOrName: string): string => {
    const lower = (slugOrName || '').toLowerCase().trim();
    if (lower.includes('starter') || lower.includes('mezze') || lower === 'starters') {
      return currentT.enums.categories.starters;
    }
    if (lower.includes('grill') || lower.includes('meat') || lower.includes('steak')) {
      return currentT.enums.categories.grill;
    }
    if (lower.includes('seafood') || lower.includes('fish')) {
      return currentT.enums.categories.seafood;
    }
    if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('pastry')) {
      return currentT.enums.categories.desserts;
    }
    if (lower.includes('beverage') || lower.includes('drink') || lower.includes('cocktail') || lower.includes('mocktail')) {
      return currentT.enums.categories.beverages;
    }
    return slugOrName;
  };

  const formatPrice = (amount: number | string | undefined | null): string => {
    return formatPriceUtil(amount, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        setLanguage,
        t: currentT,
        getDish,
        resolveLocation,
        resolveReservationStatus,
        resolveOrderStatus,
        resolveCategory,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
