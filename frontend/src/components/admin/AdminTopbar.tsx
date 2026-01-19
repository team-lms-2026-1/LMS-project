"use client";

import { useMemo } from "react";
import styles from "./admin-shell.module.css";

function formatDateKR(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminTopbar() {
  const today = useMemo(() => formatDateKR(new Date()), []);

  return (
    <div className={styles.topbarInner}>
      <div className={styles.topbarRight}>
        <div className={styles.dateChip} title="오늘 날짜">
          {today}
        </div>

        <button className={styles.profileBtn} type="button" title="프로필">
          <span className={styles.profileAvatar} aria-hidden="true" />
          <span className={styles.profileText}>관리자</span>
        </button>
      </div>
    </div>
  );
}
