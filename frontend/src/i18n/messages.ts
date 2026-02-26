import en from "./locales/en";
import ja from "./locales/ja";
import ko from "./locales/ko";
import { DEFAULT_LOCALE, type Locale } from "./locale";

const MESSAGES = {
  ko,
  en,
  ja,
} as const;

export function getMessages(locale: Locale) {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
