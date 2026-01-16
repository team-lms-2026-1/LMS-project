"use client";

import styles from "../../styles/DepartmentDetailPage.module.css";

export type DepartmentTabKey = "PROFESSOR" | "STUDENT" | "MAJOR";

type Props = {
  value: DepartmentTabKey;
  onChange: (v: DepartmentTabKey) => void;
};

export default function DepartmentTabs({ value, onChange }: Props) {
  return (
    <div className={styles.tabs}>
      <button
        type="button"
        className={`${styles.tabBtn} ${value === "PROFESSOR" ? styles.tabActive : ""}`}
        onClick={() => onChange("PROFESSOR")}
      >
        소속 교수
      </button>
      <button
        type="button"
        className={`${styles.tabBtn} ${value === "STUDENT" ? styles.tabActive : ""}`}
        onClick={() => onChange("STUDENT")}
      >
        소속 학생
      </button>
      <button
        type="button"
        className={`${styles.tabBtn} ${value === "MAJOR" ? styles.tabActive : ""}`}
        onClick={() => onChange("MAJOR")}
      >
        전공 관리
      </button>
    </div>
  );
}
