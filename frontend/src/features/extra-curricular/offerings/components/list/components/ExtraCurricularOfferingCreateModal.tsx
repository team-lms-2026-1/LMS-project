"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./ExtraCurricularOfferingCreateModal.module.css";

import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";
import { ExtraCurricularFilterDropdown } from "@/features/dropdowns/extraCurriculars/ExtraCurricularFilterDropdown";
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { createExtraCurricularOffering } from "../../../api/extraCurricularOfferingApi";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function ExtraCurricularOfferingCreateModal({
  open,
  onClose,
  onCreated,
}: Props) {
  // request payload
  const [extraCurricularId, setExtraCurricularId] = useState<number>(0);
  const [extraOfferingCode, setExtraOfferingCode] = useState<string>("");
  const [extraOfferingName, setExtraOfferingName] = useState<string>("");
  const [hostContactName, setHostContactName] = useState<string>("");
  const [hostContactPhone, setHostContactPhone] = useState<string>("");
  const [hostContactEmail, setHostContactEmail] = useState<string>("");
  const [rewardPointDefault, setRewardPointDefault] = useState<number>(0);
  const [recognizedHoursDefault, setRecognizedHoursDefault] = useState<number>(0);
  const [semesterId, setSemesterId] = useState<number>(0);

  // ✅ 날짜만 선택 (yyyy-MM-dd)
  const [operationStartDate, setOperationStartDate] = useState<string>("");
  const [operationEndDate, setOperationEndDate] = useState<string>("");

  // ✅ DatePickerInput popover 강제 닫기 신호
  const [closeSignal, setCloseSignal] = useState(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const resetAll = () => {
    setExtraCurricularId(0);
    setExtraOfferingCode("");
    setExtraOfferingName("");
    setHostContactName("");
    setHostContactPhone("");
    setHostContactEmail("");
    setRewardPointDefault(0);
    setRecognizedHoursDefault(0);
    setSemesterId(0);

    setOperationStartDate("");
    setOperationEndDate("");

    setError(null);
  };

  const handleClose = () => {
    if (loading) return;

    // ✅ 모달 닫기 전에 popover 먼저 닫기
    setCloseSignal((v) => v + 1);

    resetAll();
    onClose();
  };

  const isValidEmail = (email: string) => {
    if (!email.trim()) return true; // 선택 입력(빈 값 허용)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const validate = (): string | null => {
    if (extraCurricularId <= 0) return "비교과 프로그램을 선택하세요.";
    if (!extraOfferingCode.trim()) return "비교과운영코드를 입력하세요.";
    if (!extraOfferingName.trim()) return "비교과운영명을 입력하세요.";
    if (semesterId <= 0) return "학기를 선택하세요.";

    if (!operationStartDate) return "운영 시작일을 선택하세요.";
    if (!operationEndDate) return "운영 종료일을 선택하세요.";
    if (operationStartDate > operationEndDate)
      return "운영 시작일은 종료일보다 늦을 수 없습니다.";

    if (rewardPointDefault < 0) return "포인트(기본)는 0 이상이어야 합니다.";
    if (recognizedHoursDefault < 0) return "인정시간(기본)은 0 이상이어야 합니다.";

    if (!isValidEmail(hostContactEmail))
      return "담당자 이메일 형식이 올바르지 않습니다.";

    return null;
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ 서버가 DateTime(ISO-8601)을 기대하면, 날짜를 DateTime으로 조립
      const operationStartAt = `${operationStartDate}T00:00:00`;
      const operationEndAt = `${operationEndDate}T23:59:59`;

      await createExtraCurricularOffering({
        extraCurricularId,
        extraOfferingCode: extraOfferingCode.trim(),
        extraOfferingName: extraOfferingName.trim(),
        hostContactName: hostContactName.trim(),
        hostContactPhone: hostContactPhone.trim(),
        hostContactEmail: hostContactEmail.trim(),
        rewardPointDefault,
        recognizedHoursDefault,
        semesterId,
        operationStartAt,
        operationEndAt,
      });

      await onCreated();

      // ✅ 성공 후: popover 닫고 초기화
      setCloseSignal((v) => v + 1);
      resetAll();
      onClose();
    } catch (e: any) {
      setError(e?.error?.message ?? e?.message ?? "등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="비교과운영 등록"
      onClose={handleClose}
      size="lg"
      footer={
        <>
          <Button onClick={handleSubmit} loading={loading}>
            등록
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            취소
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.form}>
        {/* ✅ 2×2: 비교과 / 운영코드 / 운영명 / 학기 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>비교과 프로그램</div>
            <ExtraCurricularFilterDropdown
              value={extraCurricularId > 0 ? String(extraCurricularId) : ""}
              onChange={(v) => setExtraCurricularId(v ? Number(v) : 0)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>비교과운영코드</div>
            <input
              className={styles.control}
              value={extraOfferingCode}
              onChange={(e) => setExtraOfferingCode(e.target.value)}
              placeholder="예) EXTRA-2026-001"
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>비교과운영명</div>
            <input
              className={styles.control}
              value={extraOfferingName}
              onChange={(e) => setExtraOfferingName(e.target.value)}
              placeholder="예) 신입생 역량 캠프 1차"
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>학기</div>
            <SemesterFilterDropdown
              value={semesterId > 0 ? String(semesterId) : ""}
              onChange={(v) => setSemesterId(v ? Number(v) : 0)}
            />
          </label>
        </div>

        {/* ✅ 2×2: 기본 포인트 / 기본 인정시간 / 운영 시작일 / 운영 종료일 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>포인트(기본)</div>
            <input
              className={styles.control}
              type="number"
              value={rewardPointDefault === 0 ? "" : rewardPointDefault}
              onChange={(e) =>
                setRewardPointDefault(e.target.value === "" ? 0 : Number(e.target.value))
              }
              placeholder="예) 10"
              min={0}
              max={999999}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>인정시간(기본)</div>
            <input
              className={styles.control}
              type="number"
              value={recognizedHoursDefault === 0 ? "" : recognizedHoursDefault}
              onChange={(e) =>
                setRecognizedHoursDefault(e.target.value === "" ? 0 : Number(e.target.value))
              }
              placeholder="예) 2"
              min={0}
              max={999999}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>운영 시작일</div>
            <DatePickerInput
              value={operationStartDate}
              onChange={(v) => {
                setOperationStartDate(v);
                if (operationEndDate && v > operationEndDate) setOperationEndDate("");
              }}
              placeholder="시작일 선택"
              closeSignal={closeSignal}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>운영 종료일</div>
            <DatePickerInput
              value={operationEndDate}
              onChange={setOperationEndDate}
              placeholder="종료일 선택"
              min={operationStartDate || undefined}
              closeSignal={closeSignal}
            />
          </label>
        </div>

        {/* ✅ 2×2: 담당자명 / 담당자 전화 / 담당자 이메일 / 빈칸 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>담당자명</div>
            <input
              className={styles.control}
              value={hostContactName}
              onChange={(e) => setHostContactName(e.target.value)}
              placeholder="예) 홍길동"
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>담당자 전화</div>
            <input
              className={styles.control}
              value={hostContactPhone}
              onChange={(e) => setHostContactPhone(e.target.value)}
              placeholder="예) 010-1234-5678"
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>담당자 이메일</div>
            <input
              className={styles.control}
              value={hostContactEmail}
              onChange={(e) => setHostContactEmail(e.target.value)}
              placeholder="예) 담당자@school.ac.kr"
              autoComplete="off"
            />
          </label>

          <div />
        </div>
      </div>
    </Modal>
  );
}
