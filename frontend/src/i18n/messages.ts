import en from "@/i18n/locales/en";
import ja from "@/i18n/locales/ja";
import ko from "@/i18n/locales/ko";
import { DEFAULT_LOCALE, type Locale } from "./locale";

const MESSAGES = {
  ko,
  en,
  ja,
} as const;

export function getMessages(locale: Locale) {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
