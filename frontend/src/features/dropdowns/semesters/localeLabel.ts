import type { Locale } from "@/i18n/locale";

type SemesterTermKey = "FIRST" | "SECOND" | "SUMMER" | "WINTER";

const TERM_LABELS: Record<Locale, Record<SemesterTermKey, string>> = {
  ko: {
    FIRST: "1학기",
    SECOND: "2학기",
    SUMMER: "여름학기",
    WINTER: "겨울학기",
  },
  en: {
    FIRST: "Semester 1",
    SECOND: "Semester 2",
    SUMMER: "Summer",
    WINTER: "Winter",
  },
  ja: {
    FIRST: "1学期",
    SECOND: "2学期",
    SUMMER: "夏学期",
    WINTER: "冬学期",
  },
};

const TERM_PATTERNS: Array<{ key: SemesterTermKey; patterns: RegExp[] }> = [
  {
    key: "FIRST",
    patterns: [/\bsemester\s*1\b/i, /\bfirst\b/i, /1\s*학기/iu, /1\s*学期/u],
  },
  {
    key: "SECOND",
    patterns: [/\bsemester\s*2\b/i, /\bsecond\b/i, /2\s*학기/iu, /2\s*学期/u],
  },
  {
    key: "SUMMER",
    patterns: [/\bsummer\b/i, /여름\s*학기?/iu, /夏(?:学期|期)/u],
  },
  {
    key: "WINTER",
    patterns: [/\bwinter\b/i, /겨울\s*학기?/iu, /冬(?:学期|期)/u],
  },
];

export function localizeSemesterOptionLabel(displayName: string, locale: Locale): string {
  const text = String(displayName ?? "").trim();
  if (!text) return "";

  for (const term of TERM_PATTERNS) {
    for (const pattern of term.patterns) {
      if (pattern.test(text)) {
        return text.replace(pattern, TERM_LABELS[locale][term.key]).trim();
      }
    }
  }

  return text;
}

export function getSemesterDropdownPlaceholder(locale: Locale): string {
  switch (locale) {
    case "en":
      return "Semester";
    case "ja":
      return "学期";
    default:
      return "학기";
  }
}
