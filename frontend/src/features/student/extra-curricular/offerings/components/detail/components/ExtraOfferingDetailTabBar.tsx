"use client";
import styles from "./ExtraOfferingDetailTabBar.module.css";

type Tab = "detail" | "session" | "competencies";
type Props = { value: Tab; onChange: (v: Tab) => void };

export function ExtraOfferingDetailTabBar({ value, onChange }: Props) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${value === "detail" ? styles.active : ""}`}
        type="button"
        onClick={() => onChange("detail")}
      >
        상세
      </button>
      <button
        className={`${styles.tab} ${value === "session" ? styles.active : ""}`}
        type="button"
        onClick={() => onChange("session")}
      >
        회차
      </button>
      <button
        className={`${styles.tab} ${value === "competencies" ? styles.active : ""}`}
        type="button"
        onClick={() => onChange("competencies")}
      >
        역량
      </button>
    </div>
  );
}
