import React from 'react';
import { StudentMypageResponse } from '../api/types';
import styles from './Mypage.module.css';

interface Props {
    data: StudentMypageResponse;
}

export default function MypageStats({ data }: Props) {
    const stats = [
        { label: '이수 학점', value: data.totalCredits, unit: '학점' },
        { label: '이수 학점 점수', value: data.averageScore.toFixed(2), unit: '점' }, // Assuming 4.5 scale
        { label: '비교과 포인트', value: data.totalExtraPoints, unit: 'P' },
        { label: '비교과 이수 시간', value: data.totalExtraHours, unit: '시간' },
    ];

    return (
        <div className={`${styles.statsGrid} ${styles.section}`}>
            {stats.map((stat, index) => (
                <div key={index} className={styles.statCard}>
                    <dt className={styles.statLabel}>{stat.label}</dt>
                    <dd className={styles.statValue}>
                        {stat.value}<span className={styles.statUnit}>{stat.unit}</span>
                    </dd>
                </div>
            ))}
        </div>
    );
}
