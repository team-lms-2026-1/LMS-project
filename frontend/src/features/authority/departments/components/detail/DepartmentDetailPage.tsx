"use client";

import { useDepartmentDetail } from "../../hooks/useDepartmentDetail";
import { DepartmentInfo } from "./DepartmentInfo";
import { useState } from "react";
import DepartmentProfessorsTab from "./DepartmentProfessorsTab";
import DepartmentStudentsTab from "./DepartmentStudentsTab";
import DepartmentMajorsTab from "./DepartmentMajorsTab";
import { Button } from "@/components/button/Button";
import Link from "next/link"; // Next.js Link
import { useRouter } from "next/navigation";

type Props = {
    deptId: number;
};

type TabKey = "PROFESSOR" | "STUDENT" | "MAJOR";

import styles from "../../styles/DepartmentDetail.module.css";

// ...

export default function DepartmentDetailPage({ deptId }: Props) {
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
                    목록으로 →
                </button>
            </div>

            <DepartmentInfo summary={summary} loading={loadingSummary} />

            {/* Tabs */}
            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === "PROFESSOR" ? styles.tabButtonActive : ""}`}
                    onClick={() => setActiveTab("PROFESSOR")}
                >
                    소속 교수
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === "STUDENT" ? styles.tabButtonActive : ""}`}
                    onClick={() => setActiveTab("STUDENT")}
                >
                    소속 학생
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === "MAJOR" ? styles.tabButtonActive : ""}`}
                    onClick={() => setActiveTab("MAJOR")}
                >
                    전공 관리
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
