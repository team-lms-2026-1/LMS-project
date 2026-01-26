package com.teamlms.backend.domain.curricular.api.dto;

public record StudentGradeTrendItem(
    Long semesterId,
    String semesterName,      // 예: "2026-1"
    Double semesterGpa,       // 학기 평균학점(가중평균)
    Long semesterEarnedCredits // 학기 이수학점
) {}