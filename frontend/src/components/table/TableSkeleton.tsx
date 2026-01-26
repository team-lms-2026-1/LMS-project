"use client";

import skeletonStyles from "./TableSkeleton.module.css";
import tableStyles from "./Table.module.css";          // ✅ 추가
import { cn } from "./utils";                          // ✅ 추가
import type { TableAlign } from "./types";             // ✅ 추가

export function TableSkeleton({
  colCount,
  rowCount = 10,
  aligns, // ✅ 컬럼 정렬(옵션)
}: {
  colCount: number;
  rowCount?: number;
  aligns?: Array<TableAlign | undefined>;
}) {
  const rows = Array.from({ length: rowCount });

  const alignClass = (align?: TableAlign) => {
    if (align === "left") return tableStyles.alignLeft;
    if (align === "right") return tableStyles.alignRight;
    return tableStyles.alignCenter;
  };

  return (
    <>
      {rows.map((_, r) => (
        <tr key={r}>
          {Array.from({ length: colCount }).map((__, c) => (
            <td
              key={c}
              className={cn(
                tableStyles.td,            // ✅ 실제 td와 동일
                alignClass(aligns?.[c])    // ✅ 정렬도 동일
              )}
            >
              <div className={skeletonStyles.skeleton} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
