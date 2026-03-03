"use client";
import styles from "./ExtraOfferingDetailTabBar.module.css";
import { useI18n } from "@/i18n/useI18n";

type Tab = "detail" | "session" | "competencies";
type Props = { value: Tab; onChange: (v: Tab) => void };

export function ExtraOfferingDetailTabBar({ value, onChange }: Props) {
  const t = useI18n("extraCurricular.studentOfferingDetail.tabs");

  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${value === "detail" ? styles.active : ""}`}
        type="button"
        onClick={() => onChange("detail")}
      >
        {t("detail")}
      </button>
      <button
        className={`${styles.tab} ${value === "session" ? styles.active : ""}`}
        type="button"
        onClick={() => onChange("session")}
      >
        {t("session")}
      </button>
      <button
        className={`${styles.tab} ${value === "competencies" ? styles.active : ""}`}
        type="button"
        onClick={() => onChange("competencies")}
      >
        {t("competencies")}
      </button>
    </div>
  );
}
