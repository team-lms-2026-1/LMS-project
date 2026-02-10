"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import styles from "./StudentExtraOfferingDetailSection.module.css";
import { Button } from "@/components/button";

import type { ExtraCurricularOfferingDetailDto } from "../../api/types";
import { enrollExtraCurricularOffering } from "../../api/extraCurricularApi";


type Props = {
  offeringId?: number;
  data: ExtraCurricularOfferingDetailDto;
  /** 신청 성공 후 부모에서 refetch */
  onApply?: () => void | Promise<void>;
};

function pickDate(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function StudentExtraOfferingDetailSection({
  offeringId,
  data,
  onApply,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ✅ offeringId 우선순위
  const id = useMemo(() => {
    const fromData = (data as any)?.extraOfferingId as number | undefined;
    return fromData ?? offeringId;
  }, [data, offeringId]);

  // ===== (비교과 마스터) =====
  const [extraCurricularCode, setExtraCurricularCode] = useState("");
  const [extraCurricularName, setExtraCurricularName] = useState("");
  const [hostOrgName, setHostOrgName] = useState("");
  const [description, setDescription] = useState("");

  // ===== (운영) =====
  const [extraOfferingCode, setExtraOfferingCode] = useState("");
  const [semesterDisplayName, setSemesterDisplayName] = useState("");
  const [rewardPointDefault, setRewardPointDefault] = useState<number>(0);
  const [recognizedHoursDefault, setRecognizedHoursDefault] =
    useState<number>(0);
  const [operationStartDate, setOperationStartDate] = useState<string>("");
  const [operationEndDate, setOperationEndDate] = useState<string>("");

  // ===== (담당자) =====
  const [hostContactName, setHostContactName] = useState("");
  const [hostContactPhone, setHostContactPhone] = useState("");
  const [hostContactEmail, setHostContactEmail] = useState("");

  // 등록인원 (없으면 0)
  const enrolledCount = (data as any).enrolledCount ?? 0;

  const hydrateFromData = (d: ExtraCurricularOfferingDetailDto) => {
    setExtraCurricularCode(d.extraCurricularCode ?? "");
    setExtraCurricularName(d.extraCurricularName ?? "");
    setHostOrgName(d.hostOrgName ?? "");
    setDescription(d.description ?? "");

    setExtraOfferingCode(d.extraOfferingCode ?? "");
    setSemesterDisplayName(d.semesterDisplayName ?? "");

    setRewardPointDefault(d.rewardPointDefault ?? 0);
    setRecognizedHoursDefault(d.recognizedHoursDefault ?? 0);

    setOperationStartDate(pickDate(d.operationStartAt));
    setOperationEndDate(pickDate(d.operationEndAt));

    setHostContactName(d.hostContactName ?? "");
    setHostContactPhone(d.hostContactPhone ?? "");
    setHostContactEmail(d.hostContactEmail ?? "");
  };

  useEffect(() => {
    hydrateFromData(data);
    setSubmitError(null);
  }, [data]);

  const handleApply = async () => {
    if (!id) {
      toast.error("운영 ID가 없어 신청할 수 없습니다.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await enrollExtraCurricularOffering(id);
      toast.success("신청이 완료되었습니다.");
      await onApply?.(); // ✅ 목록에서 제거되도록 refetch
    } catch (e: any) {
      const msg =
        e?.body?.error?.message ||
        e?.error?.message ||
        e?.message ||
        "신청에 실패했습니다.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {submitError ? <div className={styles.error}>{submitError}</div> : null}

      {/* 1) 비교과 */}
      <section className={styles.section}>
        <Header title="비교과" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="비교과코드" value={extraCurricularCode} />
            <FieldView label="비교과명" value={extraCurricularName} />
            <FieldView label="주관기관" value={hostOrgName} />
          </Row>
        </div>
      </section>

      {/* 2) 운영 */}
      <section className={styles.section}>
        <Header title="운영" />
        <div className={styles.body}>
          <Row cols={4}>
            <FieldView label="운영코드" value={extraOfferingCode} />
            <FieldView label="포인트" value={rewardPointDefault} />
            <FieldView label="인정시간" value={recognizedHoursDefault} />
            <FieldView label="등록인원" value={enrolledCount} />
          </Row>

          <Row cols={3}>
            <FieldView label="학기" value={semesterDisplayName} />
            <FieldView label="운영 시작일" value={operationStartDate} />
            <FieldView label="운영 종료일" value={operationEndDate} />
          </Row>
        </div>
      </section>

      {/* 3) 담당자 */}
      <section className={styles.section}>
        <Header title="담당자" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="담당자명" value={hostContactName || "-"} />
            <FieldView label="담당자 전화" value={hostContactPhone || "-"} />
            <FieldView label="담당자 이메일" value={hostContactEmail || "-"} />
          </Row>
        </div>
      </section>

      {/* 4) 비고 + 신청 버튼 */}
      <section className={styles.section}>
        <Header title="비고" />
        <div className={styles.body}>
          <div className={styles.descRow}>
            <div className={styles.descLabel}>설명</div>
            <div className={`${styles.descBox} ${styles.readonlyBox}`}>
              {description || "-"}
            </div>
          </div>
        </div>

        <div className={styles.sectionFooter}>
          <Button
            variant="primary"
            onClick={handleApply}
            loading={submitting}
            disabled={submitting}
          >
            신청
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ===== 공용 UI ===== */

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

function FieldView({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      <div className={styles.valueBox}>{value}</div>
    </div>
  );
}
