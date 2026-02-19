import type { Locale } from "@/i18n/locale";

type PaginationControlKey = "first" | "prev" | "next" | "last";

function byLocale<T>(locale: Locale, values: Record<Locale, T>): T {
  return values[locale];
}

export function getOutButtonLoadingText(locale: Locale): string {
  return byLocale(locale, {
    ko: "처리중...",
    en: "Processing...",
    ja: "処理中...",
  });
}

export function getDeleteDefaultConfirmMessage(locale: Locale): string {
  return byLocale(locale, {
    ko: "정말 삭제하시겠습니까?",
    en: "Are you sure you want to delete?",
    ja: "本当に削除しますか？",
  });
}

export function getDeleteDefaultLabel(locale: Locale): string {
  return byLocale(locale, {
    ko: "삭제",
    en: "Delete",
    ja: "削除",
  });
}

export function getDeleteFailedMessage(locale: Locale): string {
  return byLocale(locale, {
    ko: "삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    en: "Failed to delete. Please try again later.",
    ja: "削除に失敗しました。しばらくしてから再試行してください。",
  });
}

export function getConfirmDefaultTitle(locale: Locale): string {
  return byLocale(locale, {
    ko: "확인",
    en: "Confirm",
    ja: "確認",
  });
}

export function getConfirmDefaultConfirmText(locale: Locale): string {
  return byLocale(locale, {
    ko: "확인",
    en: "Confirm",
    ja: "確認",
  });
}

export function getConfirmDefaultCancelText(locale: Locale): string {
  return byLocale(locale, {
    ko: "취소",
    en: "Cancel",
    ja: "キャンセル",
  });
}

export function getConfirmLoadingText(locale: Locale): string {
  return byLocale(locale, {
    ko: "처리 중...",
    en: "Processing...",
    ja: "処理中...",
  });
}

export function getSearchPlaceholder(locale: Locale): string {
  return byLocale(locale, {
    ko: "검색어를 입력하세요",
    en: "Enter search term",
    ja: "検索語を入力してください",
  });
}

export function getSearchAriaLabel(locale: Locale): string {
  return byLocale(locale, {
    ko: "검색어",
    en: "Search term",
    ja: "検索語",
  });
}

export function getSearchClearAriaLabel(locale: Locale): string {
  return byLocale(locale, {
    ko: "검색어 지우기",
    en: "Clear search term",
    ja: "検索語を消去",
  });
}

export function getSearchClearTitle(locale: Locale): string {
  return byLocale(locale, {
    ko: "지우기",
    en: "Clear",
    ja: "消去",
  });
}

export function getSearchButtonText(locale: Locale): string {
  return byLocale(locale, {
    ko: "검색",
    en: "Search",
    ja: "検索",
  });
}

export function getSearchLoadingText(locale: Locale): string {
  return byLocale(locale, {
    ko: "검색 중...",
    en: "Searching...",
    ja: "検索中...",
  });
}

export function getSearchEmptyHint(locale: Locale): string {
  return byLocale(locale, {
    ko: "검색어를 입력해주세요.",
    en: "Please enter a search term.",
    ja: "検索語を入力してください。",
  });
}

export function getTableDefaultEmptyText(locale: Locale): string {
  return byLocale(locale, {
    ko: "데이터가 없습니다.",
    en: "No data available.",
    ja: "データがありません。",
  });
}

export function getTableAriaLabel(locale: Locale): string {
  return byLocale(locale, {
    ko: "테이블",
    en: "Table",
    ja: "テーブル",
  });
}

export function getPaginationControlLabel(
  locale: Locale,
  key: PaginationControlKey
): string {
  const labels = byLocale(locale, {
    ko: { first: "처음", prev: "이전", next: "다음", last: "끝" },
    en: { first: "First", prev: "Prev", next: "Next", last: "Last" },
    ja: { first: "最初", prev: "前へ", next: "次へ", last: "最後" },
  });
  return labels[key];
}

export function getPaginationAriaLabel(locale: Locale): string {
  return byLocale(locale, {
    ko: "페이지네이션",
    en: "Pagination",
    ja: "ページネーション",
  });
}
