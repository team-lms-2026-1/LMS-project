"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

import styles from "./OfferingDetailSection.module.css";
import { Button } from "@/components/button";

import type { DayOfWeekType } from "../../api/types";
import type { CurricularOfferingDetailDto } from "@/features/curricular-offering/api/types";
import { enrollCurricularOffering } from "../../api/curricularApi";



type Props = {
  offeringId?: number; // fallback 용
  data: CurricularOfferingDetailDto;
  /** 신청 성공 후 부모에서 refetch 하고 싶으면 사용 */
  onEnrolled?: () => void | Promise<void>;
};

/** ✅ 표시용 요일 라벨 */
const DAY_OF_WEEK_LABEL: Record<
  Exclude<DayOfWeekType, string> | string,
  { short: string; long: string }
> = {
  MONDAY: { short: "월", long: "월요일" },
  TUESDAY: { short: "화", long: "화요일" },
  WEDNESDAY: { short: "수", long: "수요일" },
  THURSDAY: { short: "목", long: "목요일" },
  FRIDAY: { short: "금", long: "금요일" },
  SATURDAY: { short: "토", long: "토요일" },
  SUNDAY: { short: "일", long: "일요일" },
};

function formatDayOfWeek(v: DayOfWeekType | "" | null | undefined, mode: "short" | "long" = "short") {
  if (!v) return "-";
  const hit = DAY_OF_WEEK_LABEL[v];
  return hit ? hit[mode] : v;
}

function dash(v: React.ReactNode) {
  if (v === null || v === undefined || v === "") return "-";
  return v;
}

export function OfferingDetailSection({ data, offeringId, onEnrolled }: Props) {
  const d = data;
  const [submitting, setSubmitting] = useState(false);

  // ✅ offeringId 우선순위: data.offeringId -> props.offeringId
  const id = useMemo(() => {
    const fromData = (d as any)?.offeringId as number | undefined;
    return fromData ?? offeringId;
  }, [d, offeringId]);

  const handleEnroll = async () => {
    if (!id) {
      toast.error("운영 ID가 없어 신청할 수 없습니다.");
      return;
    }

    setSubmitting(true);
    try {
      await enrollCurricularOffering(id);
      toast.success("수강신청이 완료되었습니다.");

      // ✅ 필요하면 부모에서 상세/목록 refetch
      await onEnrolled?.();
    } catch (e: any) {
    const msg =
      e?.body?.error?.message ||
      e?.error?.message ||
      e?.message ||
      "수강신청에 실패했습니다.";

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ (선택) 정원 체크: disabled UX
  const isFull = typeof d.capacity === "number" && typeof d.enrolledCount === "number"
    ? d.enrolledCount >= d.capacity
    : false;

  return (
    <div className={styles.wrap}>
      {/* 교과 */}
      <section className={styles.section}>
        <Header title="교과" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="교과명" value={dash(d.curricularName)} />
            <FieldView label="주관학과" value={dash(d.deptName)} />
            <FieldView label="학점" value={dash((d as any).credits ?? (d as any).credit)} />
          </Row>
        </div>
      </section>

      {/* 운영 */}
      <section className={styles.section}>
        <Header title="운영" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="운영코드" value={dash(d.offeringCode)} />
            <FieldView label="등록인원" value={dash(d.enrolledCount)} />
            <FieldView label="수용인원" value={dash(d.capacity)} />
          </Row>

          <Row cols={4}>
            <FieldView label="학기" value={dash(d.semesterName)} />
            <FieldView label="요일" value={formatDayOfWeek(d.dayOfWeek, "short")} />
            <FieldView label="교시" value={(d as any).period ? `${(d as any).period}교시` : "-"} />
            <FieldView label="장소" value={dash(d.location)} />
          </Row>
        </div>
      </section>

      {/* 담당교수 */}
      <section className={styles.section}>
        <Header title="담당교수" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="담당교수명" value={dash(d.professorName)} />
            <FieldView label="전화번호" value={dash(d.phone)} />
            <FieldView label="이메일" value={dash(d.email)} />
          </Row>
        </div>
      </section>

      {/* 비고 */}
      <section className={styles.section}>
        <Header title="비고" />
        <div className={styles.body}>
          <div className={styles.descRow}>
            <div className={styles.descLabel}>설명</div>
            <div className={styles.descBox}>{dash(d.description ?? "")}</div>
          </div>
        </div>

        {/* ✅ "수정 버튼 자리" = footer 영역 */}
        <div className={styles.sectionFooter}>
          <Button
            variant="primary"
            onClick={handleEnroll}
            loading={submitting}
            disabled={submitting || isFull}
            title={isFull ? "정원이 가득 찼습니다." : undefined}
          >
            수강신청
          </Button>
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
