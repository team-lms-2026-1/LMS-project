"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./ExtraCurricularOfferingCreateModal.module.css";

import { DatePickerInput } from "@/features/admin/authority/semesters/components/ui/DatePickerInput";
import { ExtraCurricularFilterDropdown } from "@/features/dropdowns/extraCurriculars/ExtraCurricularFilterDropdown";
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { createExtraCurricularOffering } from "../../../api/extraCurricularOfferingApi";
import { useI18n } from "@/i18n/useI18n";

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
  const t = useI18n("extraCurricular.modal.offeringCreate");
  const tCommon = useI18n("extraCurricular.common");

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

  const isValidPhone = (phone: string) => {
    if (!phone.trim()) return false;
    return /^(01[016789]-?\d{3,4}-?\d{4}|0[2-9]-?\d{3,4}-?\d{4})$/.test(phone.trim());
  };

  const validate = (): string | null => {
    if (extraCurricularId <= 0) return t("validation.requiredExtraCurricular");
    if (!extraOfferingCode.trim()) return t("validation.requiredOfferingCode");
    if (!extraOfferingName.trim()) return t("validation.requiredOfferingName");
    if (semesterId <= 0) return t("validation.requiredSemester");

    if (!operationStartDate) return t("validation.requiredOperationStartDate");
    if (!operationEndDate) return t("validation.requiredOperationEndDate");
    if (operationStartDate > operationEndDate)
      return t("validation.invalidOperationPeriod");

    if (rewardPointDefault < 0) return t("validation.invalidRewardPoint");
    if (recognizedHoursDefault < 0) return t("validation.invalidRecognizedHours");

    if (!isValidPhone(hostContactPhone))
      return t("validation.invalidHostContactPhone");

    if (!isValidEmail(hostContactEmail))
      return t("validation.invalidHostContactEmail");

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
      setError(e?.error?.message ?? e?.message ?? t("submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t("title")}
      onClose={handleClose}
      size="lg"
      footer={
        <>
          <Button onClick={handleSubmit} loading={loading}>
            {tCommon("registerButton")}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {tCommon("cancelButton")}
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.form}>
        {/* ✅ 2×2: 비교과 / 운영코드 / 운영명 / 학기 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.extraCurricular")}</div>
            <ExtraCurricularFilterDropdown
              value={extraCurricularId > 0 ? String(extraCurricularId) : ""}
              onChange={(v) => setExtraCurricularId(v ? Number(v) : 0)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.offeringCode")}</div>
            <input
              className={styles.control}
              value={extraOfferingCode}
              onChange={(e) => setExtraOfferingCode(e.target.value)}
              placeholder={t("placeholders.offeringCode")}
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.offeringName")}</div>
            <input
              className={styles.control}
              value={extraOfferingName}
              onChange={(e) => setExtraOfferingName(e.target.value)}
              placeholder={t("placeholders.offeringName")}
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.semester")}</div>
            <SemesterFilterDropdown
              value={semesterId > 0 ? String(semesterId) : ""}
              onChange={(v) => setSemesterId(v ? Number(v) : 0)}
            />
          </label>
        </div>

        {/* ✅ 2×2: 기본 포인트 / 기본 인정시간 / 운영 시작일 / 운영 종료일 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.rewardPointDefault")}</div>
            <input
              className={styles.control}
              type="number"
              value={rewardPointDefault === 0 ? "" : rewardPointDefault}
              onChange={(e) =>
                setRewardPointDefault(e.target.value === "" ? 0 : Number(e.target.value))
              }
              placeholder={t("placeholders.rewardPointDefault")}
              min={0}
              max={999999}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.recognizedHoursDefault")}</div>
            <input
              className={styles.control}
              type="number"
              value={recognizedHoursDefault === 0 ? "" : recognizedHoursDefault}
              onChange={(e) =>
                setRecognizedHoursDefault(e.target.value === "" ? 0 : Number(e.target.value))
              }
              placeholder={t("placeholders.recognizedHoursDefault")}
              min={0}
              max={999999}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.operationStartDate")}</div>
            <DatePickerInput
              value={operationStartDate}
              onChange={(v) => {
                setOperationStartDate(v);
                if (operationEndDate && v > operationEndDate) setOperationEndDate("");
              }}
              placeholder={t("placeholders.operationStartDate")}
              closeSignal={closeSignal}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.operationEndDate")}</div>
            <DatePickerInput
              value={operationEndDate}
              onChange={setOperationEndDate}
              placeholder={t("placeholders.operationEndDate")}
              min={operationStartDate || undefined}
              closeSignal={closeSignal}
            />
          </label>
        </div>

        {/* ✅ 2×2: 담당자명 / 담당자 전화 / 담당자 이메일 / 빈칸 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.hostContactName")}</div>
            <input
              className={styles.control}
              value={hostContactName}
              onChange={(e) => setHostContactName(e.target.value)}
              placeholder={t("placeholders.hostContactName")}
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.hostContactPhone")}</div>
            <input
              className={styles.control}
              type="tel"
              inputMode="numeric"
              value={hostContactPhone}
              onChange={(e) => setHostContactPhone(e.target.value.replace(/[^0-9-]/g, ""))}
              placeholder={t("placeholders.hostContactPhone")}
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.hostContactEmail")}</div>
            <input
              className={styles.control}
              value={hostContactEmail}
              onChange={(e) => setHostContactEmail(e.target.value)}
              placeholder={t("placeholders.hostContactEmail")}
              autoComplete="off"
            />
          </label>

          <div />
        </div>
      </div>
    </Modal>
  );
}
