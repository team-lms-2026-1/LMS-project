"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";
import styles from "./OfferingDetailSection.module.css";
import { enrollCurricularOffering } from "../../api/curricularApi";
import type { DayOfWeekType } from "../../api/types";
import type { CurricularOfferingDetailDto } from "@/features/curricular-offering/api/types";

type Props = {
  offeringId?: number;
  data: CurricularOfferingDetailDto;
  onEnrolled?: () => void | Promise<void>;
};

const DAY_OF_WEEK_VALUES: DayOfWeekType[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function dash(value: React.ReactNode) {
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

function isKnownDayOfWeek(value: string): value is DayOfWeekType {
  return DAY_OF_WEEK_VALUES.includes(value as DayOfWeekType);
}

export function OfferingDetailSection({ data, offeringId, onEnrolled }: Props) {
  const t = useI18n("curricular.adminOfferingDetail.detail");
  const tCommon = useI18n("curricular.common");
  const tDay = useI18n("curricular.dayOfWeek");
  const tEnrollment = useI18n("curricular.status.enrollment");
  const [submitting, setSubmitting] = useState(false);
  const d = data;

  const id = useMemo(() => {
    const fromData = (d as { offeringId?: number }).offeringId;
    return fromData ?? offeringId;
  }, [d, offeringId]);

  const credits = d.credits;
  const period = d.period;

  const formatDayOfWeek = (value: DayOfWeekType | "" | null | undefined, mode: "short" | "long" = "short") => {
    if (!value) return "-";
    if (isKnownDayOfWeek(value)) {
      return tDay(`${value}.${mode}`);
    }
    return value;
  };

  const handleEnroll = async () => {
    if (!id) {
      toast.error(t("messages.saveFailed"));
      return;
    }

    setSubmitting(true);
    try {
      await enrollCurricularOffering(id);
      toast.success(tEnrollment("ENROLLED"));
      await onEnrolled?.();
    } catch (error: any) {
      const message =
        error?.body?.error?.message ??
        error?.error?.message ??
        error?.message ??
        t("messages.saveFailed");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isFull =
    typeof d.capacity === "number" && typeof d.enrolledCount === "number"
      ? d.enrolledCount >= d.capacity
      : false;

  return (
    <div className={styles.wrap}>
      <section className={styles.section}>
        <Header title={t("sections.course")} />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label={t("fields.curricularName")} value={dash(d.curricularName)} />
            <FieldView label={t("fields.deptName")} value={dash(d.deptName)} />
            <FieldView label={t("fields.credits")} value={dash(credits)} />
          </Row>
        </div>
      </section>

      <section className={styles.section}>
        <Header title={t("sections.operation")} />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label={t("fields.offeringCode")} value={dash(d.offeringCode)} />
            <FieldView label={t("fields.enrolledCount")} value={dash(d.enrolledCount)} />
            <FieldView label={t("fields.capacity")} value={dash(d.capacity)} />
          </Row>

          <Row cols={4}>
            <FieldView label={t("fields.semester")} value={dash(d.semesterName)} />
            <FieldView label={t("fields.dayOfWeek")} value={formatDayOfWeek(d.dayOfWeek, "short")} />
            <FieldView
              label={t("fields.period")}
              value={period ? t("fields.periodValue", { period }) : "-"}
            />
            <FieldView label={t("fields.location")} value={dash(d.location)} />
          </Row>
        </div>
      </section>

      <section className={styles.section}>
        <Header title={t("sections.professor")} />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label={t("fields.professorName")} value={dash(d.professorName)} />
            <FieldView label={t("fields.phone")} value={dash(d.phone)} />
            <FieldView label={t("fields.email")} value={dash(d.email)} />
          </Row>
        </div>
      </section>

      <section className={styles.section}>
        <Header title={t("sections.remark")} />
        <div className={styles.body}>
          <div className={styles.descRow}>
            <div className={styles.descLabel}>{t("fields.description")}</div>
            <div className={styles.descBox}>{dash(d.description ?? "")}</div>
          </div>
        </div>

        <div className={styles.sectionFooter}>
          <Button
            variant="primary"
            onClick={handleEnroll}
            loading={submitting}
            disabled={submitting || isFull}
          >
            {tCommon("registerButton")}
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
