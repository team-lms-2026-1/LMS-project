package com.teamlms.backend.domain.mentoring.application.dto;

import com.teamlms.backend.domain.mentoring.application.*;

import java.time.LocalDateTime;
import java.util.Map;

public record ApplicationListItem(
        Long applicationId,
        Long recruitmentId,
        ApplicationRole role,
        Map<String, Object> account,
        ApplicationStatus status,
        LocalDateTime appliedAt,
        LocalDateTime processedAt
) {}
