import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";
import styles from "./MbtiClient.module.css";

type MbtiHomeStepProps = {
  hasResult: boolean;
  loading: boolean;
  onStartTest: () => void;
  onShowResult: () => void;
};

export function MbtiHomeStep({ hasResult, loading, onStartTest, onShowResult }: MbtiHomeStepProps) {
  const t = useI18n("aiAdvisor.mbti.home");

  return (
    <div className={styles.container}>
      <section className={styles.heroCard}>
        <h1 className={styles.pageTitle}>{t("title")}</h1>
        <p className={styles.description}>{t("description")}</p>
      </section>

      <section className={styles.homeGrid}>
        <article className={styles.optionCard}>
          <div className={styles.optionTop}>
            <div className={`${styles.optionIcon} ${styles.optionIconSearch}`} aria-hidden>
              <SearchIcon />
            </div>
            <div>
              <div className={styles.optionKicker}>{t("start.kicker")}</div>
              <h2 className={styles.optionTitle}>{t("start.title")}</h2>
            </div>
          </div>
          <p className={styles.optionDesc}>{t("start.description")}</p>
          <Button className={`${styles.submitBtn} ${styles.homeActionBtn}`} onClick={onStartTest} loading={loading}>
            {t("start.button")}
          </Button>
        </article>

        <article className={styles.optionCard}>
          <div className={styles.optionTop}>
            <div className={`${styles.optionIcon} ${styles.optionIconList}`} aria-hidden>
              <ListIcon />
            </div>
            <div>
              <div className={styles.optionKicker}>{t("result.kicker")}</div>
              <h2 className={styles.optionTitle}>{t("result.title")}</h2>
            </div>
          </div>
          <p className={styles.optionDesc}>{t("result.description")}</p>
          <div className={styles.optionMeta}>
            {hasResult ? t("result.hasResult") : t("result.noResult")}
          </div>
          <Button className={`${styles.submitBtn} ${styles.homeActionBtn}`} variant="secondary" onClick={onShowResult}>
            {t("result.button")}
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
