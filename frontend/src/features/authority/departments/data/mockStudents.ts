import { Student } from "../types";

/**
 * key: departmentId
 */
export const mockStudentsByDepartment: Record<string, Student[]> = {
  D001: [
    { id: "S20240001", name: "박학생", email: "student.park@sample.com", phone: "010-2222-3333" },
    { id: "S20240002", name: "최학생", email: "student.choi@sample.com", phone: "010-4444-5555" },
    { id: "S20240003", name: "정학생", email: "student.jung@sample.com", phone: "010-6666-7777" },
  ],
  D002: [
    { id: "S20241001", name: "홍학생", email: "student.hong@sample.com", phone: "010-1010-2020" },
  ],
  D003: [],
  D004: [],
};
