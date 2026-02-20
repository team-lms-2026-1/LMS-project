"use client";

import React from "react";

import type { CurricularOfferingDetailDto, DayOfWeekType } from "../../api/types";
import styles from "./ProfessorOfferingDetailSection.module.css";

type Props = {
  data: CurricularOfferingDetailDto;
};

const DAY_OF_WEEK_LABEL: Record<Exclude<DayOfWeekType, string> | string, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
};

function formatDayOfWeek(v: DayOfWeekType | "" | null | undefined) {
  if (!v) return "-";
  return DAY_OF_WEEK_LABEL[v] ?? v;
}

function dash(v: React.ReactNode) {
  if (v === null || v === undefined || v === "") return "-";
  return v;
}

export function ProfessorOfferingDetailSection({ data }: Props) {
  return (
    <div className={styles.wrap}>
      <section className={styles.section}>
        <Header title="교과" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="교과목명" value={dash(data.curricularName)} />
            <FieldView label="주관학과" value={dash(data.deptName)} />
            <FieldView label="학점" value={dash(data.credits)} />
          </Row>
        </div>
      </section>

      <section className={styles.section}>
        <Header title="운영" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="운영코드" value={dash(data.offeringCode)} />
            <FieldView label="등록인원" value={dash(data.enrolledCount)} />
            <FieldView label="수용인원" value={dash(data.capacity)} />
          </Row>

          <Row cols={4}>
            <FieldView label="학기" value={dash(data.semesterName)} />
            <FieldView label="요일" value={formatDayOfWeek(data.dayOfWeek)} />
            <FieldView label="교시" value={data.period ? `${data.period}교시` : "-"} />
            <FieldView label="장소" value={dash(data.location)} />
          </Row>
        </div>
      </section>

      <section className={styles.section}>
        <Header title="담당교수" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="담당교수명" value={dash(data.professorName)} />
            <FieldView label="전화번호" value={dash(data.phone)} />
            <FieldView label="이메일" value={dash(data.email)} />
          </Row>
        </div>
      </section>

      <section className={styles.section}>
        <Header title="비고" />
        <div className={styles.body}>
          <div className={styles.descRow}>
            <div className={styles.descLabel}>설명</div>
            <div className={styles.descBox}>{dash(data.description)}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitle}>{title}</div>
    </div>
  );
}

function Row({ cols, children }: { cols: 3 | 4; children: React.ReactNode }) {
  return <div className={cols === 3 ? styles.row3 : styles.row4}>{children}</div>;
}

function FieldView({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      <div className={styles.valueBox}>{value}</div>
    </div>
  );
}
