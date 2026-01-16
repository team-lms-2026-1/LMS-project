"use client";

import { Department } from "../../types";
import styles from "../../styles/DepartmentDetailPage.module.css";

type Props = {
  department: Department;
};

export default function DepartmentInfoCard({ department }: Props) {
  return (
    <div className={styles.infoCard}>
      <div className={styles.infoLeft}>
        <div className={styles.infoTitle}>{department.name}</div>
        <div className={styles.infoMeta}>
          <span>학과코드: {department.code}</span>
          <span className={styles.dot} />
          <span>등록일: {department.createdAt}</span>
          <span className={styles.dot} />
          <span>상태: {department.status === "ACTIVE" ? "활성" : "비활성"}</span>
        </div>
      </div>

      <div className={styles.infoRight}>
        <div className={styles.infoDescLabel}>학과 소개</div>
        <div className={styles.infoDesc}>
          {department.description ?? "학과 설명이 없습니다."}
        </div>
      </div>
    </div>
  );
}
