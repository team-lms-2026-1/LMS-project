import styles from "../styles/CompetencyGuidePage.module.css";

export default function CompetencyGuidePage() {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.breadcrumb}>역량통합관리</p>
        <h1 className={styles.title}>역량평가란?</h1>
        <p className={styles.subtitle}>
          학생의 교과·비교과 활동 데이터를 역량 관점에서 통합 조회하고, 상담 및 지도에 활용할 수 있도록
          제공하는 관리 기능입니다.
        </p>
      </header>

      {/* 회색 안내 박스 */}
      <div className={styles.guideBox}>
        <div className={styles.guideInner}>
          <h2 className={styles.guideTitle}>역량통합관리 안내</h2>

          <p className={styles.guideText}>
            역량통합관리는 학생의 다양한 활동을 핵심역량(예: 6Cs 등) 기준으로 정리하여 한 화면에서 확인할 수
            있도록 돕습니다. 학과/부서 담당자는 학생별 역량 현황을 확인하고, 비교과 참여 이력 및 교과 연계
            정보를 바탕으로 지도·상담의 근거 자료로 활용할 수 있습니다.
          </p>

          <div className={styles.guideGrid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>무엇을 볼 수 있나요?</h3>
              <ul className={styles.list}>
                <li>학생별 핵심역량 활동 현황(통합 조회)</li>
                <li>교과(강좌)별 핵심역량 및 비중 정보</li>
                <li>비교과 역량지표 매핑 및 그룹 매핑 결과</li>
                <li>학생 자율 비교과 역량 활동 기록</li>
              </ul>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>어떻게 활용하나요?</h3>
              <ul className={styles.list}>
                <li>상담/지도 시 학생의 강점·보완 역량 파악</li>
                <li>프로그램 운영 및 개선을 위한 근거 자료 확보</li>
                <li>교과-비교과 연계 운영 현황 점검</li>
                <li>역량 항목 설명 및 매핑 관리로 데이터 품질 개선</li>
              </ul>
            </div>
          </div>

          <div className={styles.note}>
            <strong className={styles.noteTitle}>이용 안내</strong>
            <p className={styles.noteText}>
              좌측 메뉴에서 학생/역량/프로그램 관련 항목을 선택해 상세 조회 및 관리를 진행할 수 있습니다.
              본 페이지는 안내용이며, 별도의 백엔드 데이터 호출 없이 정적 문구로 구성되어 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
