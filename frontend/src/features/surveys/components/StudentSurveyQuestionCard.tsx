import { QuestionResponseDto } from "../types";
import styles from "./StudentSurveyQuestionCard.module.css";

type Props = {
    question: QuestionResponseDto;
    response: any;
    onResponseChange: (val: any) => void;
};

export function StudentSurveyQuestionCard({ question, response, onResponseChange }: Props) {
    const type = question.questionType || "RATING";
    const q = question;

    // Helper for checkbox handling
    const handleCheckboxChange = (option: string, checked: boolean) => {
        const current: string[] = Array.isArray(response) ? response : [];
        if (checked) {
            onResponseChange([...current, option]);
        } else {
            onResponseChange(current.filter(o => o !== option));
        }
    };

    return (
        <div className={styles.questionCard}>
            <div className={styles.questionText}>
                <span style={{ color: "red", marginRight: "4px" }}>{q.isRequired ? "*" : ""}</span>
                {q.questionText}
            </div>
            <div className={styles.questionTypeLabel}>
                {type === "MULTIPLE_CHOICE" && "(중복 선택 가능)"}
            </div>

            {/* RATING */}
            {type === "RATING" && (
                <div className={styles.options}>
                    <span className={styles.optionLabel}>{q.minLabel || "비동의"}</span>
                    <div className={styles.radioGroup}>
                        {[1, 2, 3, 4, 5].filter(v => v >= q.minVal && v <= q.maxVal).map((val) => (
                            <label key={val} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name={`q-${q.questionId}`}
                                    value={val}
                                    checked={Number(response) === val}
                                    onChange={() => onResponseChange(val)}
                                />
                                <span style={{ marginTop: "4px" }}>{val}</span>
                            </label>
                        ))}
                    </div>
                    <span className={styles.optionLabel}>{q.maxLabel || "동의"}</span>
                </div>
            )}

            {/* SINGLE_CHOICE */}
            {type === "SINGLE_CHOICE" && (
                <div className={styles.choiceGroup}>
                    {(q.options || []).map((opt, idx) => (
                        <label key={idx} className={styles.choiceLabel}>
                            <input
                                type="radio"
                                name={`q-${q.questionId}`}
                                checked={response === opt}
                                onChange={() => onResponseChange(opt)}
                                style={{ width: "1.2rem", height: "1.2rem" }}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* MULTIPLE_CHOICE */}
            {type === "MULTIPLE_CHOICE" && (
                <div className={styles.choiceGroup}>
                    {(q.options || []).map((opt, idx) => (
                        <label key={idx} className={styles.choiceLabel}>
                            <input
                                type="checkbox"
                                checked={(Array.isArray(response) ? response : []).includes(opt)}
                                onChange={(e) => handleCheckboxChange(opt, e.target.checked)}
                                style={{ width: "1.2rem", height: "1.2rem" }}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* ESSAY */}
            {type === "ESSAY" && (
                <div style={{ padding: "0 1rem" }}>
                    <textarea
                        className={styles.textInput}
                        value={response || ""}
                        onChange={(e) => onResponseChange(e.target.value)}
                        placeholder="답변을 입력해주세요."
                    />
                </div>
            )}
        </div>
    );
}
