import { Button } from "@/components/button";
import styles from "./MbtiClient.module.css";
import { MbtiQuestion } from "../api/types";

type MbtiTestStepProps = {
  questions: MbtiQuestion[];
  answers: Record<number, number>;
  answeredCount: number;
  allAnswered: boolean;
  submitting: boolean;
  onSelectAnswer: (questionId: number, choiceId: number) => void;
  onSubmit: () => void;
};

export function MbtiTestStep({
  questions,
  answers,
  answeredCount,
  allAnswered,
  submitting,
  onSelectAnswer,
  onSubmit,
}: MbtiTestStepProps) {
  return (
    <div className={styles.container}>
      <div className={styles.heroCard}>
        <h1 className={styles.pageTitle}>MBTI 검사</h1>
        <p className={styles.description}>
          총 {questions.length}문항 중 {answeredCount}문항 응답 완료
        </p>
      </div>

      <div className={styles.questionList}>
        {questions.map((question) => (
          <div key={question.questionId} className={styles.questionItem}>
            <div className={styles.questionText}>Q. {question.content}</div>
            <div className={styles.choices}>
              {question.choices.map((choice) => {
                const isSelected = answers[question.questionId] === choice.choiceId;
                return (
                  <button
                    key={choice.choiceId}
                    type="button"
                    className={`${styles.choiceBtn} ${isSelected ? styles.selected : ""}`}
                    onClick={() => onSelectAnswer(question.questionId, choice.choiceId)}
                  >
                    {choice.content}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actionArea}>
        <Button className={styles.submitBtn} onClick={onSubmit} loading={submitting} disabled={!allAnswered}>
          관심 키워드 선택으로 이동
        </Button>
      </div>
    </div>
  );
}

