package com.teamlms.backend.domain.mentoring.recruitment.dto;

import java.time.LocalDateTime;

public record RecruitmentCreateRequest(
        Long semesterId,
        Integer year,
        String term,
        String title,
        String description,
        LocalDateTime recruitmentStartAt,
        LocalDateTime recruitmentEndAt
) {}
