package com.teamlms.backend.domain.curricular.api.dto;

import java.util.List;

public record StudentGradeDetailHeaderResponse(
    Long studentAccountId,
    String studentName,
    String studentNo,
    Long deptId,
    String deptName,
    Integer gradeLevel,

    Double maxSemesterGpa,     // 최고학점(학기별 GPA 중 max)
    Double overallGpa,         // 평균학점(전체 GPA)
    Long totalEarnedCredits,// 총 이수학점

    List<StudentGradeTrendItem> trend // 학기별 추이
) {}