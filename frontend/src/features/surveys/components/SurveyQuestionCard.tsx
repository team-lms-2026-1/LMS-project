import { QuestionResponseDto } from "../types";
import styles from "./SurveyQuestionCard.module.css";
import { Button } from "@/components/button/Button";

type Props = {
    index: number;
    question: QuestionResponseDto;
    onUpdate: (text: string) => void;
    onRemove: () => void;
};

export function SurveyQuestionCard({ index, question, onUpdate, onRemove }: Props) {
    return (
        <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
                <span className={styles.questionNum}>{index + 1}</span>
                <input
                    className={styles.inputQuestion}
                    value={question.questionText}
                    onChange={(e) => onUpdate(e.target.value)}
                    placeholder="질문을 입력하세요"
                />
                <Button
                    variant="danger"
                    className={styles.removeBtn}
                    onClick={onRemove}
                    title="삭제"
                >
                    삭제
                </Button>
            </div>

            <div className={styles.scalePreview}>
                <span className={styles.scaleLabel}>{question.minLabel}</span>
                {[1, 2, 3, 4, 5].map((val) => (
                    <div key={val} className={styles.scaleItem}>
                        <div className={`${styles.scaleBox} ${val === 3 ? styles.scaleBoxActive : ""}`}>
                            {val}
                        </div>
                    </div>
                ))}
                <span className={styles.scaleLabel}>{question.maxLabel}</span>
            </div>
        </div>
    );
}
