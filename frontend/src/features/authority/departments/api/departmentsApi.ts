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

// cleaned comment
export async function fetchDepartmentsList(page = 1, size = 10, keyword?: string) {
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

// cleaned comment
export async function toggleDepartmentActive(deptId: number, isActive: boolean) {
    const payload: UpdateDepartmentActiveRequest = { isActive };
    return patchJson<SuccessResponse>(`${BASE_URL}/${deptId}/active`, payload);
}

// cleaned comment
export async function updateHeadProfessor(deptId: number, headProfessorAccountId: number) {
    return patchJson<SuccessResponse>(`${BASE_URL}/${deptId}/head-professor`, { headProfessorAccountId });
}

// cleaned comment
export async function fetchDepartmentMajors(deptId: number, page = 1, size = 10, keyword?: string) {
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

// cleaned comment
export async function fetchMajorForUpdate(deptId: number, majorId: number) {
    return getJson<MajorEditFormResponse>(`${BASE_URL}/${deptId}/majors/${majorId}/edit`);
}

// cleaned comment
export async function deleteMajor(deptId: number, majorId: number) {
    return deleteJson<SuccessResponse>(`${BASE_URL}/${deptId}/majors/${majorId}`);
}

// cleaned comment
export async function fetchDepartmentProfessors(deptId: number, page = 1, size = 10, keyword?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (keyword) params.append("keyword", keyword);

    return getJson<DepartmentProfessorListResponse>(`${BASE_URL}/${deptId}/professors?${params.toString()}`);
}

// cleaned comment
export async function fetchDepartmentStudents(deptId: number, page = 1, size = 10, keyword?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (keyword) params.append("keyword", keyword);

    return getJson<DepartmentStudentListResponse>(`${BASE_URL}/${deptId}/students?${params.toString()}`);
}

// cleaned comment
export async function fetchDepartmentForUpdate(deptId: number) {
    return getJson<DepartmentUpdateFormResponse>(`${BASE_URL}/${deptId}/edit`);
}


