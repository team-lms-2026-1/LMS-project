import React from "react";
import styles from "./MypageContainer.module.css";
import MypageProfile from "./MypageProfile";
import MypageStats from "./MypageStats";
import MypageTimetableSection from "./MypageTimetableSection";
import { MypageApi } from "../../api/mypageApi";

export default async function MypageContainer() {
    const data = await MypageApi.getStudentMypageServer();

    if (!data) {
        return (
            <div className={styles.error}>
                데이터를 불러오는데 실패했습니다. (로그인 상태를 확인해주세요)
            </div>
        );
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
