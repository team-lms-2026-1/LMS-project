"use client";

import { DepartmentDetailSummary } from "../../api/types";
import styles from "../../styles/DepartmentDetail.module.css";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    summary: DepartmentDetailSummary | null;
    loading: boolean;
};

export function DepartmentInfo({ summary, loading }: Props) {
    const t = useI18n("authority.departments.detail.info");

    if (loading) return <div className="p-4 bg-gray-100 rounded-t h-32 animate-pulse" />;
    if (!summary) return <div className="p-4 bg-gray-100 rounded-t text-red-500">{t("loadFailed")}</div>;

    // 설명 텍스트 생성 (통계 정보 활용)
    const description = summary.description ||
        t("autoDescription", {
            departmentName: summary.departmentName,
            enrolledCount: summary.studentCount?.enrolled || 0,
            leaveCount: summary.studentCount?.leaveOfAbsence || 0,
            graduatedCount: summary.studentCount?.graduated || 0,
            professorCount: summary.professorCount,
        });

    return (
        <div className={styles.infoCard}>
            <div className={styles.infoLeft}>
                <div className={styles.deptTitle}>
                    {summary.departmentName} <span className={styles.deptTitleSuffix}>{t("titleSuffix")}</span>
                </div>
                <div className={styles.subInfo}>
                    {t("departmentCodeLabel")}: <strong>{summary.departmentCode}</strong>
                    <span className={styles.divider}>|</span>
                    {t("chairProfessorLabel")} {summary.chairProfessor?.name || t("unassigned")}
                </div>
            </div>

            <div className={styles.infoRight}>
                {description}
            </div>
        </div>
    );
}
