import { Button } from "@/components/button";
import styles from "./MbtiClient.module.css";
import { InterestKeyword } from "../api/types";

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
  return (
    <div className={styles.container}>
      <div className={styles.heroCard}>
        <h1 className={styles.pageTitle}>관심 키워드 선택</h1>
        <p className={styles.description}>최소 {minKeywordCount}개 이상 선택해 주세요.</p>
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
          추천 결과 보기
        </Button>
      </div>
    </div>
  );
}

