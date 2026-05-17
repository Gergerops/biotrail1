import en from './en.json';
import de from './de.json';

// Supported locales. Add 'tr', 'ar', 'uk' here once translations are reviewed.
export const LOCALES = ['en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

// Locales that are listed in the UI as "coming soon" but don't have full
// translations yet. The LangSwitch shows these with a "Soon" badge and routes
// them back to the default locale if clicked.
export const SOON_LOCALES = ['tr', 'ar', 'uk'] as const;

// Locales that render right-to-left.
export const RTL_LOCALES = ['ar'] as const;

const dictionaries: Record<Locale, typeof en> = { en, de };

/**
 * Get the full translation dictionary for a locale.
 * Falls back to default locale if the requested one isn't loaded.
 */
export function getDict(locale: string): typeof en {
  return dictionaries[locale as Locale] ?? dictionaries[DEFAULT_LOCALE];
}

/**
 * Display name for each locale, in its own language.
 * Shown in the language switcher.
 */
export const LOCALE_NAMES: Record<string, string> = {
  en: '🇬🇧 English',
  de: '🇩🇪 Deutsch',
  tr: '🇹🇷 Türkçe',
  ar: '🇸🇦 العربية',
  uk: '🇺🇦 Українська',
};

/**
 * Just the flag emoji per locale — used by the language switcher trigger.
 */
export const LOCALE_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  tr: '🇹🇷',
  ar: '🇸🇦',
  uk: '🇺🇦',
};

/**
 * Is this locale RTL? Used by BaseLayout to set <html dir="rtl">.
 */
export function isRTL(locale: string): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}
