import { Professor } from "../types";

/**
 * key: departmentId
 */
export const mockProfessorsByDepartment: Record<string, Professor[]> = {
  D001: [
    { id: "P10001", name: "김교수", email: "prof.kim@sample.com", phone: "010-1234-5678" },
    { id: "P10002", name: "이교수", email: "prof.lee@sample.com", phone: "010-9876-5432" },
  ],
  D002: [
    { id: "P20001", name: "박교수", email: "prof.park@sample.com", phone: "010-2222-3333" },
  ],
  D003: [],
  D004: [],
};
