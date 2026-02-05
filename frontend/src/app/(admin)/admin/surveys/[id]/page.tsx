"use client";

import { useRouter, useParams } from "next/navigation";
import styles from "./page.module.css";
import { useSurveyDetail } from "@/features/surveys/hooks/useSurveyDetail";
import { SurveyQuestionCard } from "@/features/surveys/components/SurveyQuestionCard";
import { Button } from "@/components/button/Button";
import { TargetSelector } from "@/features/surveys/components/TargetSelector";

export default function SurveyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const idStr = params?.id as string;

    const {
        isNew,
        title,
        setTitle,
        questions,
        loading,
        addQuestion,
        removeQuestion,
        updateQuestion,
        submitSurvey,
        // Target Props
        targetType,
        setTargetType,
        selectedDeptIds,
        setSelectedDeptIds,

        selectedGrades,
        setSelectedGrades,
        // Date Props
        dates,
        setDates,
    } = useSurveyDetail(idStr);

    const handleCancel = () => {
        router.back();
    };

    if (loading && !isNew && !title) {
        return <div className={styles.page}>Loading...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{isNew ? "새 설문 등록" : "설문 수정"}</h1>
                </div>

                {/* Title Section */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>설문 제목</label>
                    <input
                        className={styles.inputTitle}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="설문 제목을 입력하세요"
                    />
                </div>

                {/* Date Section */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>설문 기간</label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: "0.9rem", color: "#666" }}>시작일시</span>
                            <input
                                type="datetime-local"
                                className={styles.inputTitle}
                                style={{ marginTop: "4px" }}
                                value={dates?.startAt?.replace(" ", "T") || ""}
                                onChange={(e) => setDates(prev => prev ? { ...prev, startAt: e.target.value } : { startAt: e.target.value, endAt: "" })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: "0.9rem", color: "#666" }}>종료일시</span>
                            <input
                                type="datetime-local"
                                className={styles.inputTitle}
                                style={{ marginTop: "4px" }}
                                value={dates?.endAt?.replace(" ", "T") || ""}
                                onChange={(e) => setDates(prev => prev ? { ...prev, endAt: e.target.value } : { startAt: "", endAt: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Target Selection Section - Only for New Surveys */}
                {isNew && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>설문 대상 설정</label>
                        <TargetSelector
                            targetType={targetType}
                            setTargetType={setTargetType}
                            selectedDeptIds={selectedDeptIds}
                            setSelectedDeptIds={setSelectedDeptIds}
                            selectedGrades={selectedGrades}
                            setSelectedGrades={setSelectedGrades}
                        />
                    </div>
                )}

                {/* Questions Section */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>설문 질문</label>
                    <div className={styles.questionList}>
                        {questions.map((q, idx) => (
                            <SurveyQuestionCard
                                key={q.questionId}
                                index={idx}
                                question={q}
                                onUpdate={(text) => updateQuestion(idx, text)}
                                onRemove={() => removeQuestion(idx)}
                            />
                        ))}
                    </div>

                    <div className={styles.addBtnWrapper}>
                        <Button variant="secondary" onClick={addQuestion} className={styles.addBtn}>
                            + 질문 추가
                        </Button>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.bottomActions}>
                    <Button variant="primary" onClick={submitSurvey} className={styles.submitBtn}>
                        {isNew ? "등록" : "수정 저장"}
                    </Button>
                    <Button variant="secondary" onClick={handleCancel} className={styles.cancelBtn}>
                        취소
                    </Button>
                </div>
            </div>
        </div>
    );
}
