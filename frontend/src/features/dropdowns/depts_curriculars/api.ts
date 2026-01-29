import { getJson } from "@/lib/http";
import { DeptCurricularsDropdownResponse } from "./types";

export async function fetchDeptCurricularDropdown(id: number) {
    const url = `/api/dropdown/depts/${id}/curriculars`
    return getJson<DeptCurricularsDropdownResponse>(url , {
        cache: "no-store"
    })
}