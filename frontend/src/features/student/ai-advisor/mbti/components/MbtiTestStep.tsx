import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";
import styles from "./MbtiClient.module.css";
import type { MbtiQuestion } from "../api/types";

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
  const t = useI18n("aiAdvisor.mbti.test");

  return (
    <div className={styles.container}>
      <div className={styles.heroCard}>
        <h1 className={styles.pageTitle}>{t("title")}</h1>
        <p className={styles.description}>
          {t("progress", {
            totalCount: questions.length,
            answeredCount,
          })}
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
          {t("submitButton")}
        </Button>
      </div>
    </div>
  );
}
