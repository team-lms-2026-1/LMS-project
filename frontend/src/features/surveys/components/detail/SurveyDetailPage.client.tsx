"use client";

import { useSurveyDetail } from "@/features/surveys/hooks/useSurveyDetail";
import { SurveyQuestionCard } from "./SurveyQuestionCard";
import { TargetSelector } from "./TargetSelector";
import { Button } from "@/components/button";
import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";
import styles from "./SurveyDetailPage.client.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
    id: string;
}

export default function SurveyDetailPageClient({ id }: Props) {
    const router = useRouter();
    const { state, actions } = useSurveyDetail(id);
    const {
        isNew, title, questions, dates, loading,
        targetType, selectedDeptIds, selectedGrades
    } = state;

    const [closeSignal, setCloseSignal] = useState(0);

    const handleDateChange = (type: 'start' | 'end', dateStr: string) => {
        if (!dates) return;
        const existingTime = (type === 'start' ? dates.startAt : dates.endAt).split('T')[1] || (type === 'start' ? '00:00' : '23:59');
        const newFull = `${dateStr}T${existingTime}`;
        actions.setDates({
            startAt: type === 'start' ? newFull : dates.startAt,
            endAt: type === 'end' ? newFull : dates.endAt,
        });
    };

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.title}>{isNew ? "새 설문 등록" : "설문 수정"}</div>
                <button className={styles.backBtn} type="button" onClick={() => router.back()}>
                    목록으로 →
                </button>
            </div>

            <div className={styles.body}>
                <section className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}>기본 정보</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>설문 유형</label>
                            <select
                                className={styles.input}
                                value={state.surveyType}
                                onChange={(e) => actions.setSurveyType(e.target.value)}
                            >
                                {state.surveyTypes.map((t) => (
                                    <option key={t.typeCode} value={t.typeCode}>
                                        {t.typeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroupFull}>
                            <label className={styles.label}>설문 제목</label>
                            <input
                                className={styles.input}
                                value={title}
                                onChange={(e) => actions.setTitle(e.target.value)}
                                placeholder="설문 제목을 입력하세요."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>시작 일시</label>
                            <DatePickerInput
                                value={dates?.startAt?.split('T')[0] || ""}
                                onChange={(v) => handleDateChange('start', v)}
                                placeholder="시작일 선택"
                                closeSignal={closeSignal}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>종료 일시</label>
                            <DatePickerInput
                                value={dates?.endAt?.split('T')[0] || ""}
                                onChange={(v) => handleDateChange('end', v)}
                                placeholder="종료일 선택"
                                min={dates?.startAt?.split('T')[0]}
                                closeSignal={closeSignal}
                            />
                        </div>
                    </div>
                </section>

                {isNew && (
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}>대상 설정</h2>
                        <TargetSelector
                            targetType={targetType}
                            setTargetType={actions.setTargetType}
                            selectedDeptIds={selectedDeptIds}
                            setSelectedDeptIds={actions.setSelectedDeptIds}
                            selectedGrades={selectedGrades}
                            setSelectedGrades={actions.setSelectedGrades}
                        />
                    </section>
                )}

                <section className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>질문 구성</h2>
                        <Button variant="secondary" onClick={actions.addQuestion}>질문 추가</Button>
                    </div>

                    <div className={styles.questionList}>
                        {questions.map((q, idx) => (
                            <SurveyQuestionCard
                                key={q.questionId}
                                question={q}
                                index={idx}
                                onUpdate={(updates) => actions.updateQuestion(idx, updates)}
                                onRemove={() => actions.removeQuestion(idx)}
                            />
                        ))}
                    </div>
                </section>

                <div className={styles.bottomActions}>
                    <Button
                        variant="primary"
                        loading={loading}
                        onClick={() => {
                            setCloseSignal(v => v + 1);
                            actions.submit();
                        }}
                        className={styles.submitBtn}
                    >
                        {isNew ? "설문 등록 완료" : "설문 수정 완료"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
