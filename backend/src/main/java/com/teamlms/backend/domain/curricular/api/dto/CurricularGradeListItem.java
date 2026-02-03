package com.teamlms.backend.domain.curricular.api.dto;

public record CurricularGradeListItem(
    Long studentAccountId,
    String studentNo,
    String deptName,
    Integer gradeLevel,
    String name,
    Double gpa
) {}