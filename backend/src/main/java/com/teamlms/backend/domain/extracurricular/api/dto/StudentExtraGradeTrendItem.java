package com.teamlms.backend.domain.extracurricular.api.dto;

public record StudentExtraGradeTrendItem(
    Long semesterId,
    String semesterName,
    Long semesterEarnedPoints,
    Long semesterEarnedHours
) {}
