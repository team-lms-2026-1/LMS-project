import { getJson, postJson, patchJson, deleteJson } from "@/lib/http";
import type {
    DepartmentListResponse,
    DepartmentSummaryResponse,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    UpdateDepartmentActiveRequest,
    MajorListResponse,
    CreateMajorRequest,
    UpdateMajorRequest,
    DepartmentProfessorListResponse,
    DepartmentStudentListResponse,
    DepartmentUpdateFormResponse,
    MajorEditFormResponse,
    SuccessResponse,
} from "./types";

const BASE_URL = "/api/admin/departments";

// 목록 조회
export async function fetchDepartmentsList(page = 1, size = 20, keyword?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (keyword) params.append("keyword", keyword);

    return getJson<DepartmentListResponse>(`${BASE_URL}?${params.toString()}`);
}

// 상세 조회 (Summary)
export async function fetchDepartmentSummary(deptId: number) {
    return getJson<DepartmentSummaryResponse>(`${BASE_URL}/${deptId}/summary`);
}

// 생성
export async function createDepartment(data: CreateDepartmentRequest) {
    return postJson<SuccessResponse>(`${BASE_URL}`, data);
}

// 수정
export async function updateDepartment(deptId: number, data: UpdateDepartmentRequest) {
    return patchJson<SuccessResponse>(`${BASE_URL}/${deptId}/edit`, data);
}

// 활성/비활성 토글
export async function toggleDepartmentActive(deptId: number, isActive: boolean) {
    const payload: UpdateDepartmentActiveRequest = { isActive };
    return patchJson<SuccessResponse>(`${BASE_URL}/${deptId}/active`, payload);
}

// 학과장 지정
export async function updateHeadProfessor(deptId: number, headProfessorAccountId: number) {
    return patchJson<SuccessResponse>(`${BASE_URL}/${deptId}/head-professor`, { headProfessorAccountId });
}

// 전공 목록 조회
export async function fetchDepartmentMajors(deptId: number, page = 1, size = 20, keyword?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (keyword) params.append("keyword", keyword);

    return getJson<MajorListResponse>(`${BASE_URL}/${deptId}/majors?${params.toString()}`);
}

// 전공 생성
export async function createMajor(deptId: number, data: CreateMajorRequest) {
    return postJson<SuccessResponse>(`${BASE_URL}/${deptId}/majors`, data);
}

// 전공 수정
export async function updateMajor(deptId: number, majorId: number, data: UpdateMajorRequest) {
    return patchJson<SuccessResponse>(`${BASE_URL}/${deptId}/majors/${majorId}/edit`, data);
}

// 전공 수정용 조회
export async function fetchMajorForUpdate(deptId: number, majorId: number) {
    return getJson<MajorEditFormResponse>(`${BASE_URL}/${deptId}/majors/${majorId}/edit`);
}

// 전공 삭제
export async function deleteMajor(deptId: number, majorId: number) {
    return deleteJson<SuccessResponse>(`${BASE_URL}/${deptId}/majors/${majorId}`);
}

// 교수 목록 조회
export async function fetchDepartmentProfessors(deptId: number, page = 1, size = 20, keyword?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (keyword) params.append("keyword", keyword);

    return getJson<DepartmentProfessorListResponse>(`${BASE_URL}/${deptId}/professors?${params.toString()}`);
}

// 학생 목록 조회
export async function fetchDepartmentStudents(deptId: number, page = 1, size = 20, keyword?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (keyword) params.append("keyword", keyword);

    return getJson<DepartmentStudentListResponse>(`${BASE_URL}/${deptId}/students?${params.toString()}`);
}

// 학과 수정용 데이터 조회
export async function fetchDepartmentForUpdate(deptId: number) {
    return getJson<DepartmentUpdateFormResponse>(`${BASE_URL}/${deptId}/edit`);
}
