import { StudentAcademicStatus } from "@/features/admin/authority/accounts/types";

export type ApiResponse<T, M = null> = {
    data: T;
    meta: M;
};

export type TimetableInfo = {
    period: number;
    location: string;
    offering_name: string;
    course_code: string;
    day_of_week: string;
    professor_name: string;
}

export type StudentMypageResponse = {
    accountId: number;
    studentNo: string;
    studentName: string;
    deptName: string;
    gradeLevel: number;
    academicStatus: StudentAcademicStatus;
    profileImageUrl: string;
    profileImageKey: string;
    totalCredits: number;
    averageScore: number;
    totalExtraPoints: number;
    totalExtraHours: number;
    currentTimetable: TimetableInfo[];
}

export type StudentMypageApiResponse = ApiResponse<StudentMypageResponse, null>;
