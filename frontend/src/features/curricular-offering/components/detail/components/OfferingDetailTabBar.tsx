"use client";
import styles from "./OfferingDetailTabBar.module.css";

type Tab = "detail" | "students" | "competencies";
type Props = { value: Tab; onChange: (v: Tab) => void };

export function OfferingDetailTabBar({ value, onChange }: Props) {
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
        className={`${styles.tab} ${value === "students" ? styles.active : ""}`}
        type="button"
        onClick={() => onChange("students")}
      >
        학생
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
