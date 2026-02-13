"use client";

import { useDepartmentDetail } from "../../hooks/useDepartmentDetail";
import { DepartmentDetailSummary } from "../../api/types";
import styles from "../../styles/DepartmentDetail.module.css";

type Props = {
    summary: DepartmentDetailSummary | null;
    loading: boolean;
};

export function DepartmentInfo({ summary, loading }: Props) {
    if (loading) return <div className="p-4 bg-gray-100 rounded-t h-32 animate-pulse" />;
    if (!summary) return <div className="p-4 bg-gray-100 rounded-t text-red-500">정보를 불러올 수 없습니다.</div>;

    // 설명 텍스트 생성 (통계 정보 활용)
    const description = summary.description ||
        `${summary.departmentName}는(은) 창의적이고 실무적인 인재 양성을 목표로 하는 학과입니다. ` +
        `현재 재학생 ${summary.studentCount?.enrolled || 0}명, ` +
        `휴학생 ${summary.studentCount?.leaveOfAbsence || 0}명, ` +
        `졸업생 ${summary.studentCount?.graduated || 0}명이 소속되어 있으며, ` +
        `총 ${summary.professorCount}명의 전임 교수가 지도하고 있습니다.`;

    return (
        <div className={styles.infoCard}>
            <div className={styles.infoLeft}>
                <div className={styles.deptTitle}>
                    {summary.departmentName} <span className={styles.deptTitleSuffix}>관리</span>
                </div>
                <div className={styles.subInfo}>
                    학과코드: <strong>{summary.departmentCode}</strong>
                    <span className={styles.divider}>|</span>
                    학과장 {summary.chairProfessor?.name || "미지정"}
                </div>
            </div>

            <div className={styles.infoRight}>
                {description}
            </div>
        </div>
    );
}
