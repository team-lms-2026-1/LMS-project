package com.teamlms.backend.domain.extracurricular.api.dto;

public record ExtraCurricularGradeListItem(
    Long studentAccountId,
    String studentNo,
    String deptName,
    Integer gradeLevel,
    String name,
    Long totalEarnedPoints,
    Long totalEarnedHours
) {}
