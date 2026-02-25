import { useI18n } from "@/i18n/useI18n";
import styles from "./MbtiClient.module.css";
import type { MbtiRecommendation, MbtiResult } from "../api/types";

type MbtiResultStepProps = {
  recommendation: MbtiRecommendation | null;
  result: MbtiResult | null;
};

export function MbtiResultStep({ recommendation, result }: MbtiResultStepProps) {
  const t = useI18n("aiAdvisor.mbti.result");
  const sortedJobs = (recommendation?.recommendations ?? [])
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);
  const selectedKeywords = recommendation?.selectedKeywords.map((keyword) => keyword.keyword) ?? [];
  const mbtiType = recommendation?.mbtiType ?? result?.mbtiType ?? "-";

  return (
    <div className={styles.container}>
      <section className={styles.resultHeroCard}>
        <h1 className={styles.pageTitle}>{t("title")}</h1>
        <p className={styles.resultIntro}>{t("intro")}</p>
        <div className={styles.mbtiType}>{mbtiType}</div>

        {selectedKeywords.length > 0 ? (
          <div className={styles.keywordChipRow}>
            {selectedKeywords.map((keyword) => (
              <span key={keyword} className={styles.keywordChip}>
                #{keyword}
              </span>
            ))}
          </div>
        ) : null}

        {result ? (
          <div className={styles.resultChart}>
            <ComparisonBar leftLabel="E" rightLabel="I" leftScore={result.score.e} rightScore={result.score.i} />
            <ComparisonBar leftLabel="S" rightLabel="N" leftScore={result.score.s} rightScore={result.score.n} />
            <ComparisonBar leftLabel="T" rightLabel="F" leftScore={result.score.t} rightScore={result.score.f} />
            <ComparisonBar leftLabel="J" rightLabel="P" leftScore={result.score.j} rightScore={result.score.p} />
          </div>
        ) : (
          <p className={styles.description}>{t("noScoreData")}</p>
        )}
      </section>

      <section className={styles.jobsSection}>
        <h2 className={styles.sectionTitle}>{t("jobsTitle")}</h2>

        {sortedJobs.length === 0 ? (
          <p className={styles.emptyMessage}>{t("emptyMessage")}</p>
        ) : (
          <div className={styles.jobList}>
            {sortedJobs.map((job) => (
              <article key={`${job.rank}-${job.jobCode}`} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <div className={styles.jobRank}>#{job.rank}</div>
                  <div>
                    <div className={styles.jobTitle}>{job.jobName}</div>
                    <div className={styles.jobCode}>{job.jobCode}</div>
                  </div>
                </div>
                <p className={styles.reasonParagraph}>
                  {buildFallbackReason(t, job.reason, job.jobName, mbtiType, selectedKeywords)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ComparisonBar({
  leftLabel,
  rightLabel,
  leftScore,
  rightScore,
}: {
  leftLabel: string;
  rightLabel: string;
  leftScore: number;
  rightScore: number;
}) {
  const total = (leftScore || 0) + (rightScore || 0) || 1;
  const leftPercent = Math.round(((leftScore || 0) / total) * 100);
  const rightPercent = 100 - leftPercent;
  const rowClass = styles[`row_${leftLabel}${rightLabel}` as keyof typeof styles] ?? "";

  return (
    <div className={`${styles.chartRow} ${rowClass}`}>
      <span className={`${styles.label} ${styles.left}`}>{leftLabel}</span>
      <div className={styles.barContainer}>
        <div className={styles.barLeft} style={{ width: `${leftPercent}%` }}>
          {leftPercent > 10 ? `${leftPercent}%` : ""}
        </div>
        <div className={styles.barRight} style={{ width: `${rightPercent}%` }}>
          {rightPercent > 10 ? `${rightPercent}%` : ""}
        </div>
      </div>
      <span className={`${styles.label} ${styles.right}`}>{rightLabel}</span>
    </div>
  );
}

function buildFallbackReason(
  t: ReturnType<typeof useI18n>,
  reason: string | undefined,
  jobName: string,
  mbtiType: string,
  selectedKeywords: string[]
) {
  const normalized = (reason ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length > 0) {
    return normalized;
  }

  if (selectedKeywords.length > 0) {
    return t("fallbackReasonWithKeywords", {
      jobName,
      mbtiType,
      keywords: selectedKeywords.slice(0, 2).join(", "),
    });
  }

  return t("fallbackReasonWithoutKeywords", { jobName, mbtiType });
}
