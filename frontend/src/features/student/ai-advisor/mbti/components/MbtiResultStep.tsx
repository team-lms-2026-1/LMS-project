import styles from "./MbtiClient.module.css";
import { MbtiRecommendation, MbtiResult } from "../api/types";

type MbtiResultStepProps = {
  recommendation: MbtiRecommendation | null;
  result: MbtiResult | null;
};

export function MbtiResultStep({ recommendation, result }: MbtiResultStepProps) {
  const sortedJobs = (recommendation?.recommendations ?? []).slice().sort((a, b) => a.rank - b.rank).slice(0, 5);
  const selectedKeywords = recommendation?.selectedKeywords.map((keyword) => keyword.keyword) ?? [];
  const mbtiType = recommendation?.mbtiType ?? result?.mbtiType ?? "-";

  return (
    <div className={styles.container}>
      <section className={styles.resultHeroCard}>
        <h1 className={styles.pageTitle}>MBTI 기반 추천 결과</h1>
        <p className={styles.resultIntro}>성향 점수와 관심 키워드를 반영한 AI 추천입니다.</p>
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
          <p className={styles.description}>저장된 MBTI 점수 정보가 없습니다.</p>
        )}
      </section>

      <section className={styles.jobsSection}>
        <h2 className={styles.sectionTitle}>AI 추천 직업 5개</h2>

        {sortedJobs.length === 0 ? (
          <p className={styles.emptyMessage}>
            저장된 직업 추천 결과가 없습니다. 검사하기에서 새로 진행해 주세요.
          </p>
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
                <p className={styles.reasonParagraph}>{toKoreanReason(job.reason, job.jobName, mbtiType, selectedKeywords)}</p>
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

function toKoreanReason(reason: string | undefined, jobName: string, mbtiType: string, selectedKeywords: string[]) {
  const normalized = (reason ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length >= 45 && hasHangul(normalized)) {
    return normalized;
  }

  const keywordPhrase =
    selectedKeywords.length > 0
      ? `${selectedKeywords.slice(0, 2).join(", ")} 관심 키워드와 실제 업무 맥락이 연결돼`
      : "선택한 관심사와 업무 특성이 맞닿아";

  return `${jobName}은 ${mbtiType} 성향에서 강점이 드러나는 방식으로 일하기 좋아요. ${keywordPhrase} 학습과 몰입을 이어가기 좋고, 프로젝트 경험을 단계적으로 쌓으면 실무 적응과 장기 진로 확장에도 유리합니다.`;
}

function hasHangul(text: string) {
  return /[가-힣]/.test(text);
}
