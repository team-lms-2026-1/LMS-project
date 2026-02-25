"use client";

import React from 'react';
import { useStudentMypage } from '../hooks/useMypage';
import MypageProfile from './MypageProfile';
import MypageStats from './MypageStats';
import MypageTimetable from './MypageTimetable';
import styles from './Mypage.module.css';




const MypageContainer = () => {
    const { data: studentData, loading, error } = useStudentMypage();

    if (loading) return <div className={styles.container}>Loading...</div>;
    if (error) return <div className={styles.container}>{error}</div>;
    if (!studentData) return null;

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>마이페이지</h1>

            <MypageProfile data={studentData} />

            <MypageStats data={studentData} />

            <MypageTimetable timetable={studentData.currentTimetable} />
        </div>
    );
};

export default MypageContainer;
