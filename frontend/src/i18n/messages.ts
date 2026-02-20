import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import { DEFAULT_LOCALE, type Locale } from "./locale";

const MESSAGES = {
  ko,
  en,
  ja,
} as const;

export function getMessages(locale: Locale) {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
