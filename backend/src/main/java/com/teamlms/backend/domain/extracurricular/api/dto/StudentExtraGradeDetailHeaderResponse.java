package com.teamlms.backend.domain.extracurricular.api.dto;

import java.util.List;

public record StudentExtraGradeDetailHeaderResponse(
    Long studentAccountId,
    String studentName,
    String studentNo,

    Long deptId,
    String deptName,
    Integer gradeLevel,

    Long totalEarnedPoints,
    Long totalEarnedHours,

    List<StudentExtraGradeTrendItem> trend
) {}
