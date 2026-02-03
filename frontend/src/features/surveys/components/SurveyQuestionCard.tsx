
import { QuestionResponseDto, SurveyQuestionType, SurveyQuestionTypeLabel } from "../types";
import styles from "./SurveyQuestionCard.module.css";
import { Button } from "@/components/button/Button";

type Props = {
    index: number;
    question: QuestionResponseDto;
    onUpdate: (updates: Partial<QuestionResponseDto>) => void;
    onRemove: () => void;
};

export function SurveyQuestionCard({ index, question, onUpdate, onRemove }: Props) {

    // Ensure default type if missing
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
                    style={{ marginLeft: "10px", padding: "4px" }}
                >
                    {Object.entries(SurveyQuestionTypeLabel).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>

                <Button
                    variant="danger"
                    className={styles.removeBtn}
                    onClick={onRemove}
                    title="삭제"
                >
                    삭제
                </Button>
            </div>

            {/* Content Body based on Type */}
            <div className={styles.questionBody} style={{ marginTop: "1rem" }}>

                {currentType === "RATING" && (
                    <div className={styles.scalePreview}>
                        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                            <input
                                placeholder="최소 라벨 (예: 전혀 아님)"
                                value={question.minLabel || ""}
                                onChange={(e) => onUpdate({ minLabel: e.target.value })}
                                style={{ border: "1px solid #ddd", padding: "4px" }}
                            />
                            <input
                                placeholder="최대 라벨 (예: 매우 그럼)"
                                value={question.maxLabel || ""}
                                onChange={(e) => onUpdate({ maxLabel: e.target.value })}
                                style={{ border: "1px solid #ddd", padding: "4px" }}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span className={styles.scaleLabel}>{question.minLabel || "최소"}</span>
                            {[1, 2, 3, 4, 5].map((val) => (
                                <div key={val} className={styles.scaleItem}>
                                    <div className={`${styles.scaleBox} ${val === 3 ? styles.scaleBoxActive : ""}`}>
                                        {val}
                                    </div>
                                </div>
                            ))}
                            <span className={styles.scaleLabel}>{question.maxLabel || "최대"}</span>
                        </div>
                    </div>
                )}


                {(currentType === "MULTIPLE_CHOICE" || currentType === "SINGLE_CHOICE") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {(question.options || []).map((opt, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {currentType === "SINGLE_CHOICE" ? (
                                    <input type="radio" disabled />
                                ) : (
                                    <input type="checkbox" disabled />
                                )}
                                <input
                                    value={opt}
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                    placeholder={`옵션 ${i + 1}`}
                                    style={{ flex: 1, padding: "4px", border: "1px solid #ddd", borderRadius: "4px" }}
                                />
                                <button onClick={() => handleRemoveOption(i)} style={{ border: "none", background: "none", cursor: "pointer", color: "red" }}>X</button>
                            </div>
                        ))}
                        <Button variant="secondary" onClick={handleAddOption} style={{ width: "fit-content", marginTop: "5px" }}>
                            + 옵션 추가
                        </Button>
                    </div>
                )}

                {currentType === "ESSAY" && (
                    <div>
                        <textarea
                            disabled
                            placeholder="주관식 답변 입력 영역 (미리보기)"
                            style={{ width: "100%", height: "80px", resize: "none", padding: "10px", backgroundColor: "#f9f9f9", border: "1px solid #eee" }}
                        />
                    </div>
                )}

            </div>
        </div>
    );
}
