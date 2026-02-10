"use client";

import { useEffect, useState } from "react";
import styles from "./ProfessorMentoring.module.css";
import { MentoringRecruitment, MentoringApplication } from "@/features/mentoring/api/types";
import { fetchAdminApplications as fetchRecruitmentApplications } from "@/features/mentoring/api/mentoringApi";

interface ApplicationModalProps {
    recruitment: MentoringRecruitment;
    onClose: () => void;
}

export function ApplicationModal({ recruitment, onClose }: ApplicationModalProps) {
    const [applications, setApplications] = useState<MentoringApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetchRecruitmentApplications(recruitment.recruitmentId);
                setApplications(res.data || []);
            } catch (e: any) {
                console.error(e);
                alert("신청자 목록 조회 실패: " + (e.message || ""));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [recruitment.recruitmentId]);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{recruitment.title}</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.formGroup}>
                    <label>설명</label>
                    <div className={styles.readOnlyText}>{recruitment.description}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.col}>
                        <div className={styles.formGroup}>
                            <label>모집 시작일</label>
                            <div className={styles.readOnlyText}>
                                {recruitment.recruitStartAt.split("T")[0]}
                            </div>
                        </div>
                    </div>
                    <div className={styles.col}>
                        <div className={styles.formGroup}>
                            <label>모집 종료일</label>
                            <div className={styles.readOnlyText}>
                                {recruitment.recruitEndAt.split("T")[0]}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>신청자 목록 ({applications.length}명)</label>
                    {loading ? (
                        <div className={styles.loadingText}>불러오는 중...</div>
                    ) : applications.length === 0 ? (
                        <div className={styles.emptyText}>신청자가 없습니다.</div>
                    ) : (
                        <div className={styles.applicationList}>
                            {applications.map((app) => (
                                <div key={app.applicationId} className={styles.applicationItem}>
                                    <div className={styles.appInfo}>
                                        <span className={styles.appName}>{app.name || app.loginId}</span>
                                        <span className={styles.appRole}>
                                            {app.role === "MENTOR" ? "멘토" : "멘티"}
                                        </span>
                                    </div>
                                    <div className={styles.appStatus}>
                                        <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase()]}`}>
                                            {app.status}
                                        </span>
                                        <span className={styles.appDate}>
                                            {new Date(app.appliedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.buttonGroup}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
