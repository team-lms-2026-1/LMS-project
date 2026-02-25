import { Table } from "@/components/table";
import type { TableColumn } from "@/components/table/types";
import { useI18n } from "@/i18n/useI18n";
import type { TimetableInfo } from "../api/types";
import styles from "./Mypage.module.css";

interface Props {
  timetable: TimetableInfo[];
}

export default function MypageTimetable({ timetable }: Props) {
  const t = useI18n("mypage.student.timetable");
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
    return timetable.find((item) => item.day_of_week === day && item.period === period);
  };

  type TimetableRow = { period: number };
  const items: TimetableRow[] = periods.map((period) => ({ period }));

  const columns: TableColumn<TimetableRow>[] = [
    {
      header: t("headers.period"),
      field: "period",
      width: 70,
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
              <div>{course.professor_name}</div>
            </div>
          </div>
        );
      },
    })),
  ];

  return (
    <div className={`${styles.card} ${styles.section}`}>
      <h3 className={styles.title}>{t("title")}</h3>
      <div className={styles.timetableWrapper}>
        <Table<TimetableRow> columns={columns} items={items} rowKey={(row) => row.period} />
      </div>
    </div>
  );
}
