'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  type Locale,
  isLocale,
} from '@/i18n/locale';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null;

  const raw = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE_KEY}=`))
    ?.split('=')[1];

  return isLocale(raw) ? raw : null;
}

function writeLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') return;

  document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

export const useLocale = () => {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) {
      setLocaleState(stored);
      writeLocaleCookie(stored);
    } else {
      const cookieLocale = readLocaleCookie();
      const resolvedLocale = cookieLocale ?? DEFAULT_LOCALE;
      setLocaleState(resolvedLocale);
      localStorage.setItem(LOCALE_STORAGE_KEY, resolvedLocale);
      writeLocaleCookie(resolvedLocale);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
  }, [locale, mounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (newLocale === locale) return;

    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    writeLocaleCookie(newLocale);
    document.documentElement.lang = newLocale;
    window.location.reload();
  }, [locale]);

  return { locale, setLocale, mounted };
};
