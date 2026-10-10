import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/i18n/LanguageContext';
import { SupportedLanguage } from '@/i18n/types';
import { Globe, ChevronDown, Check } from 'lucide-react';

const languages: { code: SupportedLanguage; label: string; flag: string; nativeName: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
];

export const LanguageSelector: React.FC<{ variant?: 'desktop' | 'mobile' }> = ({ variant = 'desktop' }) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'mobile') {
    return (
      <div className="pt-2 pb-1 border-t border-champagne/15">
        <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2 flex items-center space-x-1.5 rtl:space-x-reverse">
          <Globe className="w-3.5 h-3.5 text-champagne" />
          <span>Language / Langue / اللغة</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((item) => (
            <button
              key={item.code}
              onClick={() => setLanguage(item.code)}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg border text-xs font-medium transition ${
                language === item.code
                  ? 'bg-charcoal border-champagne text-champagne shadow-md'
                  : 'bg-midnight border-white/10 text-stone-300 hover:text-white hover:border-champagne/40'
              }`}
            >
              <span>{item.flag}</span>
              <span>{item.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-charcoal hover:bg-charcoal/80 text-stone-200 hover:text-white border border-champagne/20 hover:border-champagne/50 px-3 py-1.5 rounded-xl text-xs font-medium transition shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="font-semibold text-stone-200">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-44 rounded-xl bg-charcoal border border-champagne/20 shadow-2xl shadow-black/80 py-1.5 z-50 animate-fade-in backdrop-blur-xl">
          {languages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => {
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition ${
                  isSelected
                    ? 'bg-midnight text-champagne font-semibold'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                  <span className="text-base">{item.flag}</span>
                  <span className="font-medium">{item.nativeName}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-champagne" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
