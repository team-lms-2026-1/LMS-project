import en from "@/i18n/locales/en.json";
import ja from "@/i18n/locales/ja.json";
import ko from "@/i18n/locales/ko.json";
import { DEFAULT_LOCALE, type Locale } from "./locale";

const MESSAGES = {
  ko,
  en,
  ja,
} as const;

export function getMessages(locale: Locale) {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
