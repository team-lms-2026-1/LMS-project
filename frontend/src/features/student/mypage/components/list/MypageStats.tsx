import { StudentMypageResponse } from "../../api/types";
import styles from "./MypageStats.module.css";

interface Props {
    data: StudentMypageResponse;
}

export default function MypageStats({ data }: Props) {
    return (
        <section className={styles.container}>
            <div className={styles.statItem}>
                <span className={styles.label}>총 이수 학점</span>
                <span className={styles.value}>{data.totalCredits}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.statItem}>
                <span className={styles.label}>평점 평균</span>
                <span className={styles.value}>{data.averageScore}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.statItem}>
                <span className={styles.label}>비교과 포인트</span>
                <span className={styles.value}>{data.totalExtraPoints} <span className={styles.unit}>P</span></span>
            </div>
            <div className={styles.divider} />
            <div className={styles.statItem}>
                <span className={styles.label}>비교과 이수시간</span>
                <span className={styles.value}>{data.totalExtraHours} <span className={styles.unit}>시간</span></span>
            </div>
        </section>
    );
}
