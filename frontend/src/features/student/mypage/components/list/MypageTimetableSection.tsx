"use client";

import { TimetableInfo } from "../../api/types";
import styles from "./MypageTimetableSection.module.css";
import { Table } from "@/components/table/Table";
import { TableColumn } from "@/components/table/types";

interface Props {
    timetable: TimetableInfo[];
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const DAY_TO_FULL: Record<string, string> = {
    MON: "MONDAY",
    TUE: "TUESDAY",
    WED: "WEDNESDAY",
    THU: "THURSDAY",
    FRI: "FRIDAY",
};

export default function MypageTimetableSection({ timetable }: Props) {
    // Debug point: See what data is actually received
    console.log("[MypageTimetableSection] Received Timetable Data:", timetable);

    const getCellData = (day: string, period: number) => {
        const fullDay = DAY_TO_FULL[day];
        return (timetable || []).find((t) => {
            if (!t.day_of_week) return false;
            const targetDay = t.day_of_week.toUpperCase();
            // Match if short code ('MON') or full name ('MONDAY') matches
            return (targetDay === day || targetDay === fullDay) && t.period === period;
        });
    };

    const columns: TableColumn<number>[] = [
        {
            header: "교시",
            width: 60,
            align: "center",
            render: (period) => <div className={styles.periodCell}>{period}</div>,
        },
        ...DAYS.map((day) => ({
            header: day,
            align: "center" as const,
            render: (period: number) => {
                const data = getCellData(day, period);
                if (!data) return null;
                return (
                    <div className={styles.cellContent}>
                        <div className={styles.subject}>{data.offering_name}</div>
                        <div className={styles.room}>{data.location}</div>
                        <div className={styles.prof}>{data.professor_name}</div>
                    </div>
                );
            },
        })),
    ];

    return (
        <section className={styles.container}>
            <h3 className={styles.title}>이번 학기 시간표</h3>
            <Table
                columns={columns}
                items={PERIODS}
                rowKey={(period) => period.toString()}
                tableClassName={styles.timetable}
                wrapperClassName={styles.tableWrapper}
            />
        </section>
    );
}
