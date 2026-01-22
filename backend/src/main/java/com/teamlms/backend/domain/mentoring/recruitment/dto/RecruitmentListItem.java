package com.teamlms.backend.domain.mentoring.recruitment.dto;

import com.teamlms.backend.domain.mentoring.recruitment.RecruitmentStatus;
import java.time.LocalDateTime;

public record RecruitmentListItem(
        Long recruitmentId,
        Long semesterId,
        Integer year,
        String term,
        String title,
        LocalDateTime recruitmentStartAt,
        LocalDateTime recruitmentEndAt,
        RecruitmentStatus status,
        LocalDateTime createdAt
) {}
