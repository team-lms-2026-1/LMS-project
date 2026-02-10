"use client";

import { QuestionResponseDto, SurveyQuestionType, SurveyQuestionTypeLabel } from "../../api/types";
import styles from "./SurveyQuestionCard.module.css";
import { Button } from "@/components/button";

type Props = {
    index: number;
    question: QuestionResponseDto;
    onUpdate: (updates: Partial<QuestionResponseDto>) => void;
    onRemove: () => void;
};

export function SurveyQuestionCard({ index, question, onUpdate, onRemove }: Props) {

    const currentType = question.questionType || "RATING";

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
                    placeholder="질문을 입력하세요"
                />

                <select
                    className={styles.typeSelect}
                    value={currentType}
                    onChange={(e) => onUpdate({ questionType: e.target.value as SurveyQuestionType })}
                >
                    {Object.entries(SurveyQuestionTypeLabel).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>

                <Button
                    variant="danger"
                    onClick={onRemove}
                >
                    삭제
                </Button>
            </div>

            <div className={styles.questionBody}>
                {currentType === "RATING" && (
                    <div className={styles.ratingSection}>
                        <div className={styles.labelRow}>
                            <input
                                className={styles.inputSmall}
                                placeholder="최소 라벨 (예: 전혀 아님)"
                                value={question.minLabel || ""}
                                onChange={(e) => onUpdate({ minLabel: e.target.value })}
                            />
                            <input
                                className={styles.inputSmall}
                                placeholder="최대 라벨 (예: 매우 그럼)"
                                value={question.maxLabel || ""}
                                onChange={(e) => onUpdate({ maxLabel: e.target.value })}
                            />
                        </div>
                        <div className={styles.scalePreview}>
                            <span className={styles.scaleLabel}>{question.minLabel || "최소"}</span>
                            <div className={styles.scaleGrid}>
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <div key={val} className={`${styles.scaleBox} ${val === 3 ? styles.scaleBoxActive : ""}`}>
                                        {val}
                                    </div>
                                ))}
                            </div>
                            <span className={styles.scaleLabel}>{question.maxLabel || "최대"}</span>
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
                                    placeholder={`옵션 ${i + 1}`}
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
                            + 옵션 추가
                        </Button>
                    </div>
                )}

                {currentType === "ESSAY" && (
                    <div className={styles.essaySection}>
                        <textarea
                            className={styles.essayPreview}
                            disabled
                            placeholder="주관식 답변 입력 영역 (미리보기)"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
