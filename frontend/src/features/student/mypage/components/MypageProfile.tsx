import React from 'react';
import { StudentMypageResponse } from '../api/types';
import styles from './Mypage.module.css';
import { StatusPill } from '@/components/status/StatusPill';

interface Props {
    data: StudentMypageResponse;
}


export default function MypageProfile({ data }: Props) {

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ENROLLED': return '재학';
            case 'LEAVE': return '휴학';
            case 'GRADUATED': return '졸업';
            default: return '제적';
        }
    };

    const [imageError, setImageError] = React.useState(false);

    return (
        <div className={`${styles.card} ${styles.section}`}>
            <div className={styles.profileHeader}>
                <div className="flex-shrink-0">
                    {data.profileImageUrl && !imageError ? (
                        <img
                            src={data.profileImageUrl}
                            alt="Profile"
                            className={styles.profileImage}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className={styles.profilePlaceholder}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className={styles.profileInfo}>
                    <h2>{data.studentName}</h2>
                    <p className={styles.profileMeta}>
                        {data.deptName} | {data.studentNo} | {data.gradeLevel}학년
                    </p>
                    <div>
                        <StatusPill
                            status={data.academicStatus as any}
                            label={getStatusText(data.academicStatus)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
