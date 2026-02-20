export const LOCALES = ["ko", "en", "ja"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_STORAGE_KEY = "locale";
export const LOCALE_COOKIE_KEY = "locale";

const LOCALE_SET = new Set<string>(LOCALES);

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && LOCALE_SET.has(value);
}
