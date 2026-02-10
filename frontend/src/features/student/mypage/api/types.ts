import { StudentAcademicStatus } from "@/features/authority/accounts/types";

export type ApiResponse<T, M = null> = {
    data: T;
    meta: M;
};

export interface TimetableInfo {
    offering_name: string;
    course_code: string;
    day_of_week: string;
    period: number;
    location: string;
    professor_name: string;
}

export interface StudentMypageResponse {
    accountId: number;
    studentNo: string;
    studentName: string;
    deptName: string;
    gradeLevel: number;
    academicStatus: StudentAcademicStatus;
    profileImageUrl: string;
    profileImageKey?: string;
    totalCredits: number;
    averageScore: number;
    totalExtraPoints: number;
    totalExtraHours: number;
    currentTimetable: TimetableInfo[];
}
