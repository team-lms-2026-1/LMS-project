import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";
import styles from "./MbtiClient.module.css";
import type { InterestKeyword } from "../api/types";

type MbtiKeywordStepProps = {
  keywords: InterestKeyword[];
  selectedKeywordIds: number[];
  minKeywordCount: number;
  submitting: boolean;
  onToggleKeyword: (keywordId: number) => void;
  onSubmit: () => void;
};

export function MbtiKeywordStep({
  keywords,
  selectedKeywordIds,
  minKeywordCount,
  submitting,
  onToggleKeyword,
  onSubmit,
}: MbtiKeywordStepProps) {
  const t = useI18n("aiAdvisor.mbti.keywords");

  return (
    <div className={styles.container}>
      <div className={styles.heroCard}>
        <h1 className={styles.pageTitle}>{t("title")}</h1>
        <p className={styles.description}>{t("description", { minCount: minKeywordCount })}</p>
      </div>

      <div className={styles.keywordGrid}>
        {keywords.map((keyword) => {
          const isSelected = selectedKeywordIds.includes(keyword.id);
          return (
            <button
              key={keyword.id}
              type="button"
              className={`${styles.keywordBtn} ${isSelected ? styles.keywordSelected : ""}`}
              onClick={() => onToggleKeyword(keyword.id)}
            >
              <span className={styles.keywordName}>{keyword.keyword}</span>
              <span className={styles.keywordCategory}>{keyword.category}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.actionArea}>
        <Button
          className={styles.submitBtn}
          onClick={onSubmit}
          loading={submitting}
          disabled={selectedKeywordIds.length < minKeywordCount}
        >
          {t("submitButton")}
        </Button>
      </div>
    </div>
  );
}
