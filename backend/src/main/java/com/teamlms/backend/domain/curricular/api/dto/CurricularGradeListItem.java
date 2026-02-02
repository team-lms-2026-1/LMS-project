package com.teamlms.backend.domain.curricular.api.dto;

public record CurricularGradeListItem(
    Long enrollmentId,
    String studentNo, // StudentProfile entity
    String deptName, // Dept entity
    Long gradeLevel, // StudentProfile entity
    Long name, // StudentProfile entity
    Long gpa // Service
) {}
