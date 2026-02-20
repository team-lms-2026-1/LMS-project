"use client";

import * as React from "react";
import styles from "./PaginationSimple.module.css";
import { useLocale } from "@/hooks/useLocale";
import {
  getPaginationAriaLabel,
  getPaginationControlLabel,
} from "@/components/localeText";

export type PaginationSimpleProps = {
  page: number; // 1-base
  totalPages: number; // 1 이상
  onChange: (nextPage: number) => void;

  siblingCount?: number; // 기본 2
  boundaryCount?: number; // 기본 1 (처음/끝 근처 고정 표시)
  disabled?: boolean;
  className?: string;
};

type Item =
  | { type: "page"; value: number }
  | { type: "ellipsis"; key: string }
  | { type: "control"; key: "prev" | "next" | "first" | "last"; disabled: boolean };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function buildItems(page: number, totalPages: number, siblingCount: number, boundaryCount: number): Item[] {
  const p = clamp(page, 1, totalPages);

  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages);

  const siblingsStart = Math.max(
    Math.min(p - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  );

  const siblingsEnd = Math.min(
    Math.max(p + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
  );

  const items: Item[] = [];

  // 컨트롤 (원하는 텍스트 그대로)
  items.push({ type: "control", key: "first", disabled: p === 1 });
  items.push({ type: "control", key: "prev", disabled: p === 1 });

  // start
  for (const sp of startPages) items.push({ type: "page", value: sp });

  // start ellipsis
  if (siblingsStart > boundaryCount + 2) items.push({ type: "ellipsis", key: "start-ellipsis" });
  else if (boundaryCount + 1 < totalPages - boundaryCount) {
    const v = boundaryCount + 1;
    if (!startPages.includes(v) && (endPages.length === 0 || v < endPages[0])) items.push({ type: "page", value: v });
  }

  // siblings
  for (const v of range(siblingsStart, siblingsEnd)) {
    if (v >= 1 && v <= totalPages) items.push({ type: "page", value: v });
  }

  // end ellipsis
  if (siblingsEnd < (endPages.length > 0 ? endPages[0] - 2 : totalPages - 1)) items.push({ type: "ellipsis", key: "end-ellipsis" });
  else if (totalPages - boundaryCount > boundaryCount) {
    const v = totalPages - boundaryCount;
    if (!endPages.includes(v) && v > 0) items.push({ type: "page", value: v });
  }

  // end
  for (const ep of endPages) if (!startPages.includes(ep)) items.push({ type: "page", value: ep });

  items.push({ type: "control", key: "next", disabled: p === totalPages });
  items.push({ type: "control", key: "last", disabled: p === totalPages });

  return items;
}

export function PaginationSimple({
  page,
  totalPages,
  onChange,
  siblingCount = 2,
  boundaryCount = 1,
  disabled = false,
  className,
}: PaginationSimpleProps) {
  const { locale } = useLocale();
  const safeTotal = Math.max(1, Number.isFinite(totalPages) ? totalPages : 1);
  const current = clamp(Number(page) || 1, 1, safeTotal);
  const ariaLabel = getPaginationAriaLabel(locale);

  const items = React.useMemo(
    () => buildItems(current, safeTotal, siblingCount, boundaryCount),
    [current, safeTotal, siblingCount, boundaryCount]
  );

  const go = (next: number) => {
    const v = clamp(next, 1, safeTotal);
    if (v === current) return;
    onChange(v);
  };

  const onControl = (k: "prev" | "next" | "first" | "last") => {
    if (disabled) return;
    if (k === "first") return go(1);
    if (k === "last") return go(safeTotal);
    if (k === "prev") return go(current - 1);
    if (k === "next") return go(current + 1);
  };

  return (
    <nav className={`${styles.wrap} ${className ?? ""}`} aria-label={ariaLabel}>
      <div className={styles.inner}>
        {items.map((it) => {
          if (it.type === "ellipsis") {
            return (
              <span key={it.key} className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            );
          }

          if (it.type === "control") {
            const isDisabled = disabled || it.disabled;
            return (
              <button
                key={it.key}
                type="button"
                className={`${styles.control} ${isDisabled ? styles.disabled : ""}`}
                onClick={() => onControl(it.key)}
                disabled={isDisabled}
              >
                {getPaginationControlLabel(locale, it.key)}
              </button>
            );
          }

          const active = it.value === current;
          return (
            <button
              key={it.value}
              type="button"
              className={`${styles.page} ${active ? styles.active : ""}`}
              onClick={() => !disabled && go(it.value)}
              disabled={disabled || active}
              aria-current={active ? "page" : undefined}
            >
              {it.value}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
