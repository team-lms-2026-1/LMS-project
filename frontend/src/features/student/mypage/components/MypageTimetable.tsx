import { TimetableInfo } from '../api/types';
import styles from './Mypage.module.css';
import { Table } from '@/components/table';
import { TableColumn } from '@/components/table/types';

interface Props {
    timetable: TimetableInfo[];
}

export default function MypageTimetable({ timetable }: Props) {
    const periods = [1, 2, 3, 4, 5, 6];
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const;
    const daysLabel: { [key: string]: string } = {
        'MONDAY': '월', 'TUESDAY': '화', 'WEDNESDAY': '수', 'THURSDAY': '목', 'FRIDAY': '금'
    };

    const getCourseForCell = (day: string, period: number) => {
        return timetable.find(t => t.day_of_week === day && t.period === period);
    };

    type TimetableRow = { period: number };
    const items: TimetableRow[] = periods.map(p => ({ period: p }));

    const columns: TableColumn<TimetableRow>[] = [
        {
            header: "교시",
            field: "period",
            width: 80,
            align: "center",
            cellClassName: styles.periodCell,
        },
        ...days.map(day => ({
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
                            <div>{course.professor_name}</div>
                        </div>
                    </div>
                );
            }
        }))
    ];

    return (
        <div className={`${styles.card} ${styles.section}`}>
            <h3 className={styles.title}>이번 학기 시간표</h3>
            <Table<TimetableRow>
                columns={columns}
                items={items}
                rowKey={(row) => row.period}
            />
        </div>
    );
}
