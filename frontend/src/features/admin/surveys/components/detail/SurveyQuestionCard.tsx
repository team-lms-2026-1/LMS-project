"use client";

import { QuestionResponseDto, SurveyQuestionType } from "../../api/types";
import styles from "./SurveyQuestionCard.module.css";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    index: number;
    question: QuestionResponseDto;
    onUpdate: (updates: Partial<QuestionResponseDto>) => void;
    onRemove: () => void;
};

export function SurveyQuestionCard({ index, question, onUpdate, onRemove }: Props) {
    const t = useI18n("survey.admin.questionCard");
    const tQuestionTypes = useI18n("survey.common.questionTypes.long");

    const currentType = question.questionType || "RATING";
    const questionTypes: SurveyQuestionType[] = ["RATING", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "ESSAY"];

    const questionTypeLabel = (type: SurveyQuestionType) => {
        if (type === "RATING") return tQuestionTypes("RATING");
        if (type === "SINGLE_CHOICE") return tQuestionTypes("SINGLE_CHOICE");
        if (type === "MULTIPLE_CHOICE") return tQuestionTypes("MULTIPLE_CHOICE");
        return tQuestionTypes("ESSAY");
    };

    const handleAddOption = () => {
        const newOptions = [...(question.options || []), ""];
        onUpdate({ options: newOptions });
    };

    const handleOptionChange = (optIndex: number, val: string) => {
        const newOptions = [...(question.options || [])];
        newOptions[optIndex] = val;
        onUpdate({ options: newOptions });
    };

    const handleRemoveOption = (optIndex: number) => {
        const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
        onUpdate({ options: newOptions });
    };

    return (
        <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
                <span className={styles.questionNum}>{index + 1}</span>
                <input
                    className={styles.inputQuestion}
                    value={question.questionText}
                    onChange={(e) => onUpdate({ questionText: e.target.value })}
                    placeholder={t("placeholderQuestion")}
                />

                <select
                    className={styles.typeSelect}
                    value={currentType}
                    onChange={(e) => onUpdate({ questionType: e.target.value as SurveyQuestionType })}
                >
                    {questionTypes.map((type) => (
                        <option key={type} value={type}>{questionTypeLabel(type)}</option>
                    ))}
                </select>

                <Button
                    variant="danger"
                    onClick={onRemove}
                >
                    {t("buttons.delete")}
                </Button>
            </div>

            <div className={styles.questionBody}>
                {currentType === "RATING" && (
                    <div className={styles.ratingSection}>
                        <div className={styles.labelRow}>
                            <input
                                className={styles.inputSmall}
                                placeholder={t("placeholders.minLabel")}
                                value={question.minLabel || ""}
                                onChange={(e) => onUpdate({ minLabel: e.target.value })}
                            />
                            <input
                                className={styles.inputSmall}
                                placeholder={t("placeholders.maxLabel")}
                                value={question.maxLabel || ""}
                                onChange={(e) => onUpdate({ maxLabel: e.target.value })}
                            />
                        </div>
                        <div className={styles.scalePreview}>
                            <span className={styles.scaleLabel}>{question.minLabel || t("scale.minFallback")}</span>
                            <div className={styles.scaleGrid}>
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <div key={val} className={`${styles.scaleBox} ${val === 3 ? styles.scaleBoxActive : ""}`}>
                                        {val}
                                    </div>
                                ))}
                            </div>
                            <span className={styles.scaleLabel}>{question.maxLabel || t("scale.maxFallback")}</span>
                        </div>
                    </div>
                )}

                {(currentType === "MULTIPLE_CHOICE" || currentType === "SINGLE_CHOICE") && (
                    <div className={styles.optionList}>
                        {(question.options || []).map((opt, i) => (
                            <div key={i} className={styles.optionItem}>
                                <input
                                    type={currentType === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                                    disabled
                                />
                                <input
                                    className={styles.optionInput}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                    placeholder={t("placeholders.option", { index: i + 1 })}
                                />
                                <button
                                    type="button"
                                    className={styles.removeOption}
                                    onClick={() => handleRemoveOption(i)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <Button
                            variant="secondary"
                            onClick={handleAddOption}
                            style={{ width: "fit-content" }}
                        >
                            {t("buttons.addOption")}
                        </Button>
                    </div>
                )}

                {currentType === "ESSAY" && (
                    <div className={styles.essaySection}>
                        <textarea
                            className={styles.essayPreview}
                            disabled
                            placeholder={t("placeholders.essayPreview")}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
