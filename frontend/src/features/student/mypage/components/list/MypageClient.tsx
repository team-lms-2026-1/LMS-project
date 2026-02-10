"use client";

import React from "react";
import styles from "./MypageClient.module.css";
import { StudentMypageResponse } from "../../api/types";
import MypageProfile from "./MypageProfile";
import MypageStats from "./MypageStats";
import MypageTimetableSection from "./MypageTimetableSection";

interface Props {
    data: StudentMypageResponse | null;
    isLoading?: boolean;
    error?: Error | null;
}

export default function MypageClient({ data, isLoading, error }: Props) {
    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.error}>에러가 발생했습니다: {error.message}</div>;
    }

    if (!data) {
        return <div className={styles.empty}>데이터가 없습니다.</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>마이페이지</h1>
            <MypageProfile data={data} />
            <MypageStats data={data} />
            <MypageTimetableSection timetable={data.currentTimetable} />
        </div>
    );
}
