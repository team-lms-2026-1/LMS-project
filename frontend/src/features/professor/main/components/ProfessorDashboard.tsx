"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import {
    fetchCurricularDetailForm,
    fetchCurricularOfferingsList,
} from "@/features/professor/curricular/api/curricularOfferingsApi";
import { useNoticesList } from "@/features/professor/community/notices/hooks/useNoticeList";
import type { NoticeListItemDto } from "@/features/professor/community/notices/api/types";
import styles from "./ProfessorDashboard.module.css";
import { useI18n } from "@/i18n/useI18n";

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
    const t = useI18n("community.notices.professor.table");

    const [timetableInfoList, setTimetableInfoList] = useState<TimetableInfo[]>([]);
    const [timetableLoading, setTimetableLoading] = useState(true);

    const { state: noticeState } = useNoticesList();

    useEffect(() => {
        // 1. 교수의 최근 개설 교과목 목록 가져오기
        fetchCurricularOfferingsList({ page: 1, size: 20 })
            .then(async (res) => {
                const offeringIds = res.data.map((item) => item.offeringId);

                // 2. 각 교과목의 상세 정보(요일, 교시 등)를 병행해서 가져오기
                const detailPromises = offeringIds.map((id) =>
                    fetchCurricularDetailForm(id).catch(() => null)
                );
                const details = await Promise.all(detailPromises);

                const mapped: TimetableInfo[] = [];
                details.forEach((d) => {
                    if (d && d.data) {
                        mapped.push({
                            period: d.data.period,
                            location: d.data.location,
                            offering_name: d.data.curricularName,
                            course_code: d.data.offeringCode,
                            day_of_week: d.data.dayOfWeek,
                            professor_name: d.data.professorName,
                        });
                    }
                });

                setTimetableInfoList(mapped);
            })
            .catch(console.error)
            .finally(() => setTimetableLoading(false));
    }, []);

    const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;
    const daysLabel: { [key: string]: string } = {
        MONDAY: "월",
        TUESDAY: "화",
        WEDNESDAY: "수",
        THURSDAY: "목",
        FRIDAY: "금",
    };

    const getCourseForCell = (day: string, period: number) => {
        return timetableInfoList.find((t) => t.day_of_week === day && t.period === period);
    };

    type TimetableRow = { period: number };
    const timetableItems: TimetableRow[] = periods.map((p) => ({ period: p }));

    const timetableColumns: TableColumn<TimetableRow>[] = [
        {
            header: "교시",
            field: "period",
            width: 80,
            align: "center",
            cellClassName: styles.periodCell,
        },
        ...days.map((day) => ({
            header: daysLabel[day],
            width: 150,
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
        { header: "ID", width: 60, align: "center", render: (r) => r.noticeId },
        {
            header: "카테고리",
            width: 120,
            align: "center",
            render: (r) => {
                const c = r.category;
                if (!c) return "미분류";
                return (
                    <Badge bgColor={c.bgColorHex} textColor={c.textColorHex}>
                        {c.name}
                    </Badge>
                );
            },
        },
        { header: "제목", align: "left", render: (r) => r.title },
        { header: "조회수", width: 80, align: "center", render: (r) => r.viewCount },
        { header: "작성일", width: 140, align: "center", render: (r) => r.createdAt },
    ];

    return (
        <div className={styles.page}>

            {/* 1. 시간표 영역 */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>이번 학기 내 강의 시간표</h2>
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/professor/curricular/offerings")}
                    >
                        내 강의 목록
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

            {/* 2. 공지사항 영역 */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>최근 공지사항</h2>
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/professor/community/notices")}
                    >
                        전체 공지사항
                    </Button>
                </div>
                <div className={styles.tableWrap}>
                    <Table<NoticeListItemDto>
                        columns={noticeColumns}
                        items={noticeState.items.slice(0, 5)} // 최근 5건
                        loading={noticeState.loading}
                        rowKey={(r) => r.noticeId}
                        emptyText="등록된 공지사항이 없습니다."
                        onRowClick={(r) => router.push(`/professor/community/notices/${r.noticeId}`)}
                    />
                </div>
            </div>
        </div>
    );
}
