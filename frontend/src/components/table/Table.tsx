"use client";

import type { ReactNode } from "react";
import styles from "./Table.module.css";
import type { RowKey, TableColumn, TableRowClassName } from "./types";
import { cn, isEmptyValue, toCssWidth } from "./utils";
import { TableEmptyRow } from "./TableEmptyRow";
import { TableSkeleton } from "./TableSkeleton";
import { useLocale } from "@/hooks/useLocale";
import { getTableAriaLabel, getTableDefaultEmptyText } from "@/components/localeText";

type Props<T> = {
  columns: Array<TableColumn<T>>;
  items: T[];
  rowKey: RowKey<T>;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: TableRowClassName<T>;
  emptyText?: ReactNode;
  wrapperClassName?: string;
  tableClassName?: string;
  useColGroup?: boolean;
  ariaLabel?: string;

  loading?: boolean;
  skeletonRowCount?: number;
};

function alignClass(align?: "left" | "center" | "right") {
  if (align === "left") return styles.alignLeft;
  if (align === "right") return styles.alignRight;
  return styles.alignCenter;
}

export function Table<T>({
  columns,
  items,
  rowKey,
  onRowClick,
  rowClassName,
  emptyText,
  wrapperClassName,
  tableClassName,
  useColGroup = true,
  ariaLabel,
  loading = false,
  skeletonRowCount = 8,
}: Props<T>) {
  const { locale } = useLocale();
  const hasRowClick = typeof onRowClick === "function";
  const colCount = columns.length;
  const resolvedEmptyText = emptyText ?? getTableDefaultEmptyText(locale);
  const resolvedAriaLabel = ariaLabel ?? getTableAriaLabel(locale);

  return (
    <div className={cn(styles.tableWrapper, wrapperClassName)}>
      <table className={cn(styles.table, tableClassName)} aria-label={resolvedAriaLabel}>
        {useColGroup && (
          <colgroup>
            {columns.map((c, i) => (
              <col key={i} style={{ width: toCssWidth(c.width) }} />
            ))}
          </colgroup>
        )}

        <thead className={styles.thead}>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn(styles.th, alignClass(c.align), c.headerClassName)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* ✅ 로딩이면: 같은 테이블/같은 td 패딩/같은 colgroup 유지 */}
          {loading ? (
            <TableSkeleton colCount={colCount} rowCount={skeletonRowCount} aligns={columns.map((c) => c.align)}/>
          ) : (
            <>
              {items.map((row, idx) => {
                const key = rowKey(row, idx);
                const isLast = idx === items.length - 1;

                const rowCls =
                  typeof rowClassName === "function"
                    ? rowClassName(row, idx)
                    : rowClassName;

                return (
                  <tr
                    key={key}
                    className={cn(
                      isLast && styles.trLast,
                      hasRowClick && styles.clickableRow,
                      rowCls
                    )}
                    onClick={() => onRowClick?.(row, idx)}
                  >
                    {columns.map((col, cidx) => {
                      const content =
                        col.render?.(row, idx) ??
                        (!isEmptyValue(col.field)
                          ? (row as any)[col.field as any]
                          : "");

                      const tdTitle = col.title?.(row);

                      const tdClickStopper = col.stopRowClick
                        ? (e: React.MouseEvent) => e.stopPropagation()
                        : undefined;

                      return (
                        <td
                          key={cidx}
                          className={cn(
                            styles.td,
                            alignClass(col.align),
                            col.cellClassName
                          )}
                          title={tdTitle}
                          onClick={tdClickStopper}
                        >
                          {content as ReactNode}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {items.length === 0 && (
                <TableEmptyRow colSpan={colCount}>{resolvedEmptyText}</TableEmptyRow>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
