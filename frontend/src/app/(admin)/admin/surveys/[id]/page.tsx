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
    } = useSurveyDetail(idStr);

    const handleCancel = () => {
        router.back();
    };

    if (loading && !isNew && !title) {
        return <div className={styles.container}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>{isNew ? "새 설문 등록" : "설문 수정"}</h1>
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
    );
}
