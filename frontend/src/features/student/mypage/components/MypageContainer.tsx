"use client";

import React from "react";
import { useI18n } from "@/i18n/useI18n";
import { useStudentMypage } from "../hooks/useMypage";
import MypageProfile from "./MypageProfile";
import MypageStats from "./MypageStats";
import MypageTimetable from "./MypageTimetable";
import styles from "./Mypage.module.css";

const MypageContainer = () => {
  const t = useI18n("mypage.student.page");
  const { data: studentData, loading, error } = useStudentMypage();

  if (loading) return <div className={styles.container}>{t("loading")}</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!studentData) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>{t("title")}</h1>
      <MypageProfile data={studentData} />
      <MypageStats data={studentData} />
      <MypageTimetable timetable={studentData.currentTimetable} />
    </div>
  );
};

export default MypageContainer;
