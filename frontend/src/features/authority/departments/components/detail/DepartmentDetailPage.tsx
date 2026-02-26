"use client";

import { useDepartmentDetail } from "../../hooks/useDepartmentDetail";
import { DepartmentInfo } from "./DepartmentInfo";
import { useState } from "react";
import DepartmentProfessorsTab from "./DepartmentProfessorsTab";
import DepartmentStudentsTab from "./DepartmentStudentsTab";
import DepartmentMajorsTab from "./DepartmentMajorsTab";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    deptId: number;
};

type TabKey = "PROFESSOR" | "STUDENT" | "MAJOR";

import styles from "../../styles/DepartmentDetail.module.css";

// ...

export default function DepartmentDetailPage({ deptId }: Props) {
    const t = useI18n("authority.departments.detail.page");
    const router = useRouter();
    const { summary, loadingSummary, reloadSummary } = useDepartmentDetail(deptId);
    const [activeTab, setActiveTab] = useState<TabKey>("PROFESSOR");

    return (
        <div className={styles.pageContainer}>
            <div className={styles.topBar}>
                <button
                    className={styles.backBtn}
                    onClick={() => router.push("/admin/authority/departments")}
                >
                    {t("backToList")}
                </button>
            </div>

            <DepartmentInfo summary={summary} loading={loadingSummary} />

            {/* Tabs */}
            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === "PROFESSOR" ? styles.tabButtonActive : ""}`}
                    onClick={() => setActiveTab("PROFESSOR")}
                >
                    {t("tabs.professors")}
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === "STUDENT" ? styles.tabButtonActive : ""}`}
                    onClick={() => setActiveTab("STUDENT")}
                >
                    {t("tabs.students")}
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === "MAJOR" ? styles.tabButtonActive : ""}`}
                    onClick={() => setActiveTab("MAJOR")}
                >
                    {t("tabs.majors")}
                </button>
            </div>

            <div className={styles.contentArea}>
                {activeTab === "PROFESSOR" && (
                    <DepartmentProfessorsTab
                        deptId={deptId}
                        summary={summary}
                        reloadSummary={reloadSummary}
                    />
                )}
                {activeTab === "STUDENT" && <DepartmentStudentsTab deptId={deptId} summary={summary} />}
                {activeTab === "MAJOR" && <DepartmentMajorsTab deptId={deptId} />}
            </div>
        </div>
    );
}
