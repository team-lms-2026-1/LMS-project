package com.teamlms.backend.domain.curricular.api.dto;

public record StudentCourseGradeListItem(
    Long enrollmentId,
    Long semesterId,
    String semesterName,   // 이수학기
    String curricularCode, // 교과코드
    String curricularName, // 교과명
    Integer credits,       // 이수학점
    String grade           // A/B/C/D/E/F
) {}