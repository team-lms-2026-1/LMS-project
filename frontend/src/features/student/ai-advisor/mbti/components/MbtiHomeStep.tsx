import { Button } from "@/components/button";
import styles from "./MbtiClient.module.css";

type MbtiHomeStepProps = {
  hasResult: boolean;
  loading: boolean;
  onStartTest: () => void;
  onShowResult: () => void;
};

export function MbtiHomeStep({ hasResult, loading, onStartTest, onShowResult }: MbtiHomeStepProps) {
  return (
    <div className={styles.container}>
      <section className={styles.heroCard}>
        <h1 className={styles.pageTitle}>MBTI AI 추천</h1>
        <p className={styles.description}>
          검사하기를 누르면 기존 결과가 있어도 새 결과로 덮어씁니다.
        </p>
      </section>

      <section className={styles.homeGrid}>
        <article className={styles.optionCard}>
          <div className={styles.optionTop}>
            <div className={`${styles.optionIcon} ${styles.optionIconSearch}`} aria-hidden>
              <SearchIcon />
            </div>
            <div>
              <div className={styles.optionKicker}>새로 시작</div>
              <h2 className={styles.optionTitle}>검사하기</h2>
            </div>
          </div>
          <p className={styles.optionDesc}>MBTI 검사를 새로 진행하고 관심 키워드를 선택해 추천을 생성합니다.</p>
          <Button className={`${styles.submitBtn} ${styles.homeActionBtn}`} onClick={onStartTest} loading={loading}>
            검사 시작
          </Button>
        </article>

        <article className={styles.optionCard}>
          <div className={styles.optionTop}>
            <div className={`${styles.optionIcon} ${styles.optionIconList}`} aria-hidden>
              <ListIcon />
            </div>
            <div>
              <div className={styles.optionKicker}>바로 확인</div>
              <h2 className={styles.optionTitle}>결과보기</h2>
            </div>
          </div>
          <p className={styles.optionDesc}>저장된 최신 MBTI/직업 추천 결과를 바로 확인합니다.</p>
          <div className={styles.optionMeta}>{hasResult ? "저장된 결과가 있습니다." : "저장된 결과가 없습니다."}</div>
          <Button className={`${styles.submitBtn} ${styles.homeActionBtn}`} variant="secondary" onClick={onShowResult}>
            결과 보기
          </Button>
        </article>
      </section>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.optionSvg} fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.optionSvg} fill="none">
      <path d="M8 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="4.5" cy="7" r="1.5" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4.5" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}
