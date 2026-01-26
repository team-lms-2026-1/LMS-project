"use client";

import type { ReactNode } from "react";
import styles from "./TableEmptyRow.module.css";

export function TableEmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className={styles.emptyRow}>
        {children}
      </td>
    </tr>
  );
}
