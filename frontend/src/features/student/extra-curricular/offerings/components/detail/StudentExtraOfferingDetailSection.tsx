"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import styles from "./StudentExtraOfferingDetailSection.module.css";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";

import type { ExtraCurricularOfferingDetailDto } from "../../api/types";
import { enrollExtraCurricularOffering } from "../../api/extraCurricularApi";

type Props = {
  offeringId?: number;
  data: ExtraCurricularOfferingDetailDto;
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
  const t = useI18n("extraCurricular.studentOfferingDetail.detail");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const id = useMemo(() => {
    const fromData = (data as any)?.extraOfferingId as number | undefined;
    return fromData ?? offeringId;
  }, [data, offeringId]);

  const [extraCurricularCode, setExtraCurricularCode] = useState("");
  const [extraCurricularName, setExtraCurricularName] = useState("");
  const [hostOrgName, setHostOrgName] = useState("");
  const [description, setDescription] = useState("");

  const [extraOfferingCode, setExtraOfferingCode] = useState("");
  const [semesterDisplayName, setSemesterDisplayName] = useState("");
  const [rewardPointDefault, setRewardPointDefault] = useState<number>(0);
  const [recognizedHoursDefault, setRecognizedHoursDefault] =
    useState<number>(0);
  const [operationStartDate, setOperationStartDate] = useState<string>("");
  const [operationEndDate, setOperationEndDate] = useState<string>("");

  const [hostContactName, setHostContactName] = useState("");
  const [hostContactPhone, setHostContactPhone] = useState("");
  const [hostContactEmail, setHostContactEmail] = useState("");

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
      toast.error(t("messages.missingOfferingId"));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await enrollExtraCurricularOffering(id);
      toast.success(t("messages.applySuccess"));
      await onApply?.();
    } catch (e: any) {
      const msg =
        e?.body?.error?.message ||
        e?.error?.message ||
        e?.message ||
        t("messages.applyFailed");
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {submitError ? <div className={styles.error}>{submitError}</div> : null}

      <section className={styles.section}>
        <Header title={t("sections.program")} />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label={t("fields.programCode")} value={extraCurricularCode} />
            <FieldView label={t("fields.programName")} value={extraCurricularName} />
            <FieldView label={t("fields.hostOrgName")} value={hostOrgName} />
          </Row>
        </div>
      </section>

      <section className={styles.section}>
        <Header title={t("sections.operation")} />
        <div className={styles.body}>
          <Row cols={4}>
            <FieldView label={t("fields.offeringCode")} value={extraOfferingCode} />
            <FieldView label={t("fields.rewardPoint")} value={rewardPointDefault} />
            <FieldView label={t("fields.recognizedHours")} value={recognizedHoursDefault} />
            <FieldView label={t("fields.enrolledCount")} value={enrolledCount} />
          </Row>

          <Row cols={3}>
            <FieldView label={t("fields.semester")} value={semesterDisplayName} />
            <FieldView label={t("fields.operationStartDate")} value={operationStartDate} />
            <FieldView label={t("fields.operationEndDate")} value={operationEndDate} />
          </Row>
        </div>
      </section>

      <section className={styles.section}>
        <Header title={t("sections.contact")} />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label={t("fields.contactName")} value={hostContactName || "-"} />
            <FieldView label={t("fields.contactPhone")} value={hostContactPhone || "-"} />
            <FieldView label={t("fields.contactEmail")} value={hostContactEmail || "-"} />
          </Row>
        </div>
      </section>

      <section className={styles.section}>
        <Header title={t("sections.remark")} />
        <div className={styles.body}>
          <div className={styles.descRow}>
            <div className={styles.descLabel}>{t("fields.description")}</div>
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
            {t("buttons.apply")}
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
