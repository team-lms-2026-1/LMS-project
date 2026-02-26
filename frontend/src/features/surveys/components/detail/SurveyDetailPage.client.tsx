"use client";

import { useSurveyDetail } from "@/features/surveys/hooks/useSurveyDetail";
import { SurveyQuestionCard } from "./SurveyQuestionCard";
import { TargetSelector } from "./TargetSelector";
import { Button } from "@/components/button";
import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";
import styles from "./SurveyDetailPage.client.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useI18n } from "@/i18n/useI18n";

interface Props {
    id: string;
}

export default function SurveyDetailPageClient({ id }: Props) {
    const tDetail = useI18n("survey.admin.detail");
    const tTypes = useI18n("survey.common.types");
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

    const typeOptions = useMemo(() => {
        const typeLabel = (typeCode: string) => {
            if (typeCode === "SATISFACTION") return tTypes("SATISFACTION");
            if (typeCode === "COURSE") return tTypes("COURSE");
            if (typeCode === "SERVICE") return tTypes("SERVICE");
            if (typeCode === "ETC") return tTypes("ETC");
            return typeCode;
        };

        return state.surveyTypes.map((t) => ({
            value: t.typeCode,
            label: typeLabel(t.typeCode),
        }));
    }, [state.surveyTypes, tTypes]);

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.title}>{isNew ? tDetail("titleNew") : tDetail("titleEdit")}</div>
                <Button
                    variant="secondary"
                    onClick={() => router.back()}
                    style={{ height: '36px', fontSize: '14px', padding: '0 12px' }}
                >
                    {tDetail("backToList")}
                </Button>
            </div>

            <div className={styles.body}>
                <section className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}>{tDetail("sections.basicInfo")}</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{tDetail("fields.surveyType")}</label>
                            <Dropdown
                                value={state.surveyType}
                                options={typeOptions}
                                onChange={(val) => {
                                    if (val !== "") actions.setSurveyType(val);
                                }}
                                placeholder={tDetail("placeholders.typeSelect")}
                            />
                        </div>
                        <div className={styles.formGroupFull}>
                            <label className={styles.label}>{tDetail("fields.title")}</label>
                            <input
                                className={styles.input}
                                value={title}
                                onChange={(e) => actions.setTitle(e.target.value)}
                                placeholder={tDetail("placeholders.title")}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{tDetail("fields.startAt")}</label>
                            <DatePickerInput
                                value={dates?.startAt?.split('T')[0] || ""}
                                onChange={(v) => handleDateChange('start', v)}
                                placeholder={tDetail("placeholders.startDate")}
                                closeSignal={closeSignal}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{tDetail("fields.endAt")}</label>
                            <DatePickerInput
                                value={dates?.endAt?.split('T')[0] || ""}
                                onChange={(v) => handleDateChange('end', v)}
                                placeholder={tDetail("placeholders.endDate")}
                                min={dates?.startAt?.split('T')[0]}
                                closeSignal={closeSignal}
                            />
                        </div>
                    </div>
                </section>

                {isNew && (
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}>{tDetail("sections.target")}</h2>
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
                        <h2 className={styles.sectionTitle}>{tDetail("sections.questions")}</h2>
                        <Button variant="secondary" onClick={actions.addQuestion}>{tDetail("buttons.addQuestion")}</Button>
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
                        {isNew ? tDetail("buttons.submitNew") : tDetail("buttons.submitEdit")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
