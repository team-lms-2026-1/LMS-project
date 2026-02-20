// src/app/providers.tsx
"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { useLocale } from "@/hooks/useLocale";
import { getMessages } from "@/i18n/messages";
import { DEFAULT_LOCALE } from "@/i18n/locale";

export function Providers({ children }: { children: React.ReactNode }) {
  const { locale, mounted: localeMounted } = useLocale();
  const [mounted, setMounted] = React.useState(false);
  const activeLocale = localeMounted ? locale : DEFAULT_LOCALE;
  const messages = getMessages(activeLocale);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!localeMounted) {
    return null;
  }

  return (
    <NextIntlClientProvider locale={activeLocale} messages={messages}>
      <AuthProvider>
        {children}
        {mounted && <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
