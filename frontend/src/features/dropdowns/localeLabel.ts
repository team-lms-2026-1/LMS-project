import type { Locale } from "@/i18n/locale";
import type { DropdownOption } from "./_shared/Dropdown";

const DAY_OF_WEEK_OPTIONS: Record<Locale, DropdownOption[]> = {
  ko: [
    { value: "MONDAY", label: "월" },
    { value: "TUESDAY", label: "화" },
    { value: "WEDNESDAY", label: "수" },
    { value: "THURSDAY", label: "목" },
    { value: "FRIDAY", label: "금" },
    { value: "SATURDAY", label: "토" },
    { value: "SUNDAY", label: "일" },
  ],
  en: [
    { value: "MONDAY", label: "Mon" },
    { value: "TUESDAY", label: "Tue" },
    { value: "WEDNESDAY", label: "Wed" },
    { value: "THURSDAY", label: "Thu" },
    { value: "FRIDAY", label: "Fri" },
    { value: "SATURDAY", label: "Sat" },
    { value: "SUNDAY", label: "Sun" },
  ],
  ja: [
    { value: "MONDAY", label: "月" },
    { value: "TUESDAY", label: "火" },
    { value: "WEDNESDAY", label: "水" },
    { value: "THURSDAY", label: "木" },
    { value: "FRIDAY", label: "金" },
    { value: "SATURDAY", label: "土" },
    { value: "SUNDAY", label: "日" },
  ],
};

function range(size: number): number[] {
  return Array.from({ length: size }, (_, index) => index + 1);
}

export function getPeriodOptions(locale: Locale): DropdownOption[] {
  const periods = range(6);
  if (locale === "en") return periods.map((n) => ({ value: String(n), label: `Period ${n}` }));
  if (locale === "ja") return periods.map((n) => ({ value: String(n), label: `${n}限` }));
  return periods.map((n) => ({ value: String(n), label: `${n}교시` }));
}

export function getDayOfWeekOptions(locale: Locale): DropdownOption[] {
  return DAY_OF_WEEK_OPTIONS[locale];
}

export function getDropdownDefaultPlaceholder(locale: Locale): string {
  if (locale === "en") return "Select";
  if (locale === "ja") return "選択";
  return "선택";
}

export function getDropdownLoadingLabel(locale: Locale): string {
  if (locale === "en") return "Loading...";
  if (locale === "ja") return "読み込み中...";
  return "불러오는 중...";
}

export function getDeptDropdownPlaceholder(locale: Locale): string {
  if (locale === "en") return "Department";
  if (locale === "ja") return "学科";
  return "학과";
}

export function getCurricularDropdownPlaceholder(locale: Locale): string {
  if (locale === "en") return "Curricular";
  if (locale === "ja") return "教科";
  return "교과";
}

export function getProfessorDropdownPlaceholder(locale: Locale): string {
  if (locale === "en") return "Professor";
  if (locale === "ja") return "担当教員";
  return "담당교수";
}

export function getExtraCurricularDropdownPlaceholder(locale: Locale): string {
  if (locale === "en") return "Extra-Curricular";
  if (locale === "ja") return "課外";
  return "비교과";
}

export function getPeriodDropdownPlaceholder(locale: Locale): string {
  if (locale === "en") return "Period";
  if (locale === "ja") return "時限";
  return "교시";
}

export function getDayOfWeekDropdownPlaceholder(locale: Locale): string {
  if (locale === "en") return "Day";
  if (locale === "ja") return "曜日";
  return "요일";
}

