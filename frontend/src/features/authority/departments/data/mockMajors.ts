import { Major } from "../types";

/**
 * key: departmentId
 */
export const mockMajorsByDepartment: Record<string, Major[]> = {
  D001: [
    { id: "M01", code: "C001", name: "소프트웨어" },
    { id: "M02", code: "C002", name: "인공지능" },
    { id: "M03", code: "C003", name: "네트워크" },
  ],
  D002: [
    { id: "M11", code: "E001", name: "회로설계" },
    { id: "M12", code: "E002", name: "임베디드" },
  ],
  D003: [],
  D004: [],
};
