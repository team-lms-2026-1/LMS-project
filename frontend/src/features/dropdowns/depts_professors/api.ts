import { getJson } from "@/lib/http";
import { DeptProfessorsDropdownResponse } from "./types";

export async function fetchDeptProfessorDropdown(id: number) {
    const url = `/api/dropdown/depts/${id}/professors`
    return getJson<DeptProfessorsDropdownResponse>(url , {
        cache: "no-store"
    })
}