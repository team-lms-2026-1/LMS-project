import { DepartmentDetail } from "../types";
import { mockDepartments } from "./mockDepartments";
import { mockProfessorsByDepartment } from "./mockProfessors";
import { mockStudentsByDepartment } from "./mockStudents";
import { mockMajorsByDepartment } from "./mockMajors";

export function getMockDepartmentDetail(departmentId: string): DepartmentDetail {
  const department =
    mockDepartments.find((d) => d.id === departmentId) ?? mockDepartments[0];

  return {
    department,
    professors: mockProfessorsByDepartment[department.id] ?? [],
    students: mockStudentsByDepartment[department.id] ?? [],
    majors: mockMajorsByDepartment[department.id] ?? [],
  };
}
