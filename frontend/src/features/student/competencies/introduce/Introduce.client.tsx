"use client";

import styles from "./Introduce.module.css";

const SIX_CS = [
  {
    key: "creativity",
    title: "창의성 (Creativity)",
    description: "새로운 관점으로 문제를 바라보고 독창적인 아이디어를 만들어 실행하는 능력입니다.",
  },
  {
    key: "critical-thinking",
    title: "비판적 사고 (Critical Thinking)",
    description: "정보의 타당성을 검토하고 근거 기반으로 판단하며 합리적인 결론에 도달하는 능력입니다.",
  },
  {
    key: "collaboration",
    title: "협업 (Collaboration)",
    description: "공동 목표를 위해 역할을 조정하고 팀과 함께 성과를 만들어 내는 능력입니다.",
  },
  {
    key: "communication",
    title: "소통 (Communication)",
    description: "생각을 명확하게 전달하고 다양한 방식으로 상호 이해를 이끄는 능력입니다.",
  },
  {
    key: "citizenship",
    title: "시민성 (Citizenship)",
    description: "공동체의 규범과 책임을 이해하고 윤리적·지속가능한 선택을 실천하는 태도입니다.",
  },
  {
    key: "character",
    title: "인성/자기관리 (Character)",
    description: "성실함과 공감, 자기주도성을 바탕으로 꾸준히 성장하는 힘입니다.",
  },
] as const;

export default function CompetencyPageClient() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>역량 안내</p>
          <h1 className={styles.title}>6CS 역량이란?</h1>
          <p className={styles.lead}>
            6CS는 학습자가 미래 사회에서 요구되는 핵심 역량을 균형 있게 키우기 위한 공통 기준입니다.
            지식 습득에 더해 실제 문제를 해결하고 협력하며 책임 있게 행동하는 힘을 길러 줍니다.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6CS의 여섯 가지 역량</h2>
          <ul className={styles.list}>
            {SIX_CS.map((item) => (
              <li key={item.key} className={styles.listItem}>
                <div className={styles.listTitle}>{item.title}</div>
                <p className={styles.listDesc}>{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>학습에서의 활용</h2>
          <p className={styles.paragraph}>
            6CS는 교과 수업, 비교과 활동, 프로젝트 경험을 하나의 언어로 연결해 줍니다. 이를 통해
            자신의 강점과 보완점을 더 명확히 파악할 수 있습니다.
          </p>
          <p className={styles.paragraph}>
            활동을 마친 뒤 어떤 역량이 강화되었는지 성찰하면, 다음 목표와 학습 계획을 더욱 구체적으로
            세울 수 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>진단에서의 계산 식</h2>
          <p className={styles.paragraph}>
            (진단지 5지선다 점수 * 6cs 각각의 점수) + (진단지 서술형 점수 + 6cs 각각의 점수) = 6cs 진단지의 점수
          </p>
          <p className={styles.paragraph}>
            (비교과 활동 포인트 * 비교과의 할당된 6cs 점수 * 10) = 비교과 활동의 점수
          </p>
          <p className={styles.paragraph}>
            (교과 활동 포인트 * 교과의 할당된 6cs 점수) = 교과 활동의 점수
          </p>
          <p className={styles.paragraph}>
            (진단지 점수 + 비교과 활동 점수 + 교과 활동 점수) = 6cs 총점
          </p>
          <h2 className={styles.sectionTitle}>
            총점을 기준으로 중간값, 평균값 등을 계산하여 6cs 각각의 점수를 산출한다.
          </h2>
        </section>
      </div>
    </div>
  );
}
