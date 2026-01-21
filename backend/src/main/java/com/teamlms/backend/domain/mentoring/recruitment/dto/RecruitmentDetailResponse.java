package com.teamlms.backend.domain.mentoring.recruitment.dto;

import java.time.LocalDateTime;

public record RecruitmentDetailResponse(
        String title,
        String description,
        LocalDateTime recruitmentStartAt,
        LocalDateTime recruitmentEndAt
) {}
