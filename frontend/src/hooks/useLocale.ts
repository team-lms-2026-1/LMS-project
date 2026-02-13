'use client';

import { useCallback, useEffect, useState } from 'react';

type Locale = 'ko' | 'en' | 'ja';

export const useLocale = () => {
  const [locale, setLocaleState] = useState<Locale>('ko');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored && ['ko', 'en', 'ja'].includes(stored)) {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  }, []);

  return { locale, setLocale, mounted };
};
