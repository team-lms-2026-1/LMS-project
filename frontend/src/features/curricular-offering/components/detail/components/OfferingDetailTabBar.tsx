"use client";
import styles from "./OfferingDetailTabBar.module.css";
import { useI18n } from "@/i18n/useI18n";

type Tab = "detail" | "competencies";
type Props = { value: Tab; onChange: (v: Tab) => void };

export function OfferingDetailTabBar({ value, onChange }: Props) {
  const t = useI18n("curricular.adminOfferingDetail.tabs");

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
        className={`${styles.tab} ${value === "competencies" ? styles.active : ""}`}
        type="button"
        onClick={() => onChange("competencies")}
      >
        {t("competencies")}
      </button>
    </div>
  );
}
