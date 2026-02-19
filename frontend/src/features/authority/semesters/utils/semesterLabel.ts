import type { Locale } from "@/i18n/locale";
import type { SemesterStatus, SemesterTerm } from "../api/types";

const TERM_LABELS: Record<Locale, Record<string, string>> = {
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

const STATUS_LABELS: Record<Locale, Record<string, string>> = {
  ko: {
    PLANNED: "예정",
    ACTIVE: "진행중",
    CLOSED: "종료",
  },
  en: {
    PLANNED: "Planned",
    ACTIVE: "Active",
    CLOSED: "Closed",
  },
  ja: {
    PLANNED: "予定",
    ACTIVE: "進行中",
    CLOSED: "終了",
  },
};

export const SEMESTER_TERMS: SemesterTerm[] = ["FIRST", "SECOND", "SUMMER", "WINTER"];
export const SEMESTER_STATUSES: SemesterStatus[] = ["PLANNED", "ACTIVE", "CLOSED"];

export function termToLabel(term: SemesterTerm, locale: Locale): string {
  return TERM_LABELS[locale][term] ?? term;
}

export function statusToLabel(status: SemesterStatus, locale: Locale): string {
  return STATUS_LABELS[locale][status] ?? status;
}
