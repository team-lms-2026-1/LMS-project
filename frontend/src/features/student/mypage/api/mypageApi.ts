import { getJson } from "@/lib/http";
import { StudentMypageApiResponse } from "./types";

export async function fetchStudentMypage() {
    const url = `/api/student/mypage`;
    return getJson<StudentMypageApiResponse>(url, {
        cache: "no-store"
    });
}
