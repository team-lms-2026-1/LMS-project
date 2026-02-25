"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Table, type TableColumn } from "@/components/table";
import type { NoticeListItemDto } from "@/features/professor/community/notices/api/types";
import { useNoticesList } from "@/features/professor/community/notices/hooks/useNoticeList";
import {
  fetchCurricularDetailForm,
  fetchCurricularOfferingsList,
} from "@/features/professor/curricular/api/curricularOfferingsApi";
import { useI18n } from "@/i18n/useI18n";
import styles from "./ProfessorDashboard.module.css";

type TimetableInfo = {
  period: number;
  location: string;
  offering_name: string;
  course_code: string;
  day_of_week: string;
  professor_name: string;
};

export default function ProfessorDashboard() {
  const router = useRouter();
  const t = useI18n("mypage.professor.dashboard");
  const [timetableInfoList, setTimetableInfoList] = useState<TimetableInfo[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(true);
  const { state: noticeState } = useNoticesList();

  useEffect(() => {
    fetchCurricularOfferingsList({ page: 1, size: 20 })
      .then(async (res) => {
        const offeringIds = res.data.map((item) => item.offeringId);
        const detailPromises = offeringIds.map((id) => fetchCurricularDetailForm(id).catch(() => null));
        const details = await Promise.all(detailPromises);

        const mapped: TimetableInfo[] = [];
        details.forEach((detail) => {
          if (!detail?.data) return;
          mapped.push({
            period: detail.data.period,
            location: detail.data.location,
            offering_name: detail.data.curricularName,
            course_code: detail.data.offeringCode,
            day_of_week: detail.data.dayOfWeek,
            professor_name: detail.data.professorName,
          });
        });

        setTimetableInfoList(mapped);
      })
      .catch(console.error)
      .finally(() => setTimetableLoading(false));
  }, []);

  const periods = [1, 2, 3, 4, 5, 6];
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
  const daysLabel: Record<(typeof days)[number], string> = {
    MONDAY: t("days.monday"),
    TUESDAY: t("days.tuesday"),
    WEDNESDAY: t("days.wednesday"),
    THURSDAY: t("days.thursday"),
    FRIDAY: t("days.friday"),
    SATURDAY: t("days.saturday"),
    SUNDAY: t("days.sunday"),
  };

  const getCourseForCell = (day: string, period: number) => {
    return timetableInfoList.find((item) => item.day_of_week === day && item.period === period);
  };

  type TimetableRow = { period: number };
  const timetableItems: TimetableRow[] = periods.map((period) => ({ period }));

  const timetableColumns: TableColumn<TimetableRow>[] = [
    {
      header: t("tables.timetable.headers.period"),
      field: "period",
      width: 80,
      align: "center",
      cellClassName: styles.periodCell,
    },
    ...days.map((day) => ({
      header: daysLabel[day],
      width: 140,
      align: "center" as const,
      cellClassName: styles.timetableCell,
      render: (row: TimetableRow) => {
        const course = getCourseForCell(day, row.period);
        if (!course) return null;
        return (
          <div className={styles.courseItem} title={course.offering_name}>
            <span className={styles.courseName}>{course.offering_name}</span>
            <div className={styles.courseDetail}>
              <div>{course.location}</div>
              <div>{course.course_code}</div>
            </div>
          </div>
        );
      },
    })),
  ];

  const noticeColumns: Array<TableColumn<NoticeListItemDto>> = [
    { header: t("tables.notice.headers.id"), width: 60, align: "center", render: (row) => row.noticeId },
    {
      header: t("tables.notice.headers.category"),
      width: 120,
      align: "center",
      render: (row) => {
        const category = row.category;
        if (!category) return t("tables.notice.uncategorized");
        return (
          <Badge bgColor={category.bgColorHex} textColor={category.textColorHex}>
            {category.name}
          </Badge>
        );
      },
    },
    {
      header: t("tables.notice.headers.title"),
      align: "left",
      cellClassName: styles.noticeTitleCell,
      title: (row) => row.title,
      render: (row) => <span className={styles.noticeTitleText}>{row.title}</span>,
    },
    { header: t("tables.notice.headers.views"), width: 80, align: "center", render: (row) => row.viewCount },
    { header: t("tables.notice.headers.createdAt"), width: 140, align: "center", render: (row) => row.createdAt },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("sections.timetable.title")}</h2>
          <Button variant="secondary" onClick={() => router.push("/professor/curricular/offerings")}>
            {t("sections.timetable.button")}
          </Button>
        </div>
        <div className={styles.tableWrap}>
          <Table<TimetableRow>
            columns={timetableColumns}
            items={timetableItems}
            loading={timetableLoading}
            rowKey={(row) => row.period}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("sections.notices.title")}</h2>
          <Button variant="secondary" onClick={() => router.push("/professor/community/notices")}>
            {t("sections.notices.button")}
          </Button>
        </div>
        <div className={styles.tableWrap}>
          <Table<NoticeListItemDto>
            columns={noticeColumns}
            items={noticeState.items.slice(0, 5)}
            loading={noticeState.loading}
            rowKey={(row) => row.noticeId}
            emptyText={t("tables.notice.empty")}
            onRowClick={(row) => router.push(`/professor/community/notices/${row.noticeId}`)}
          />
        </div>
      </div>
    </div>
  );
}
