package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record SurveyParticipantResponse(
        Long targetId,
        Long accountId,
        String loginId,
        String name,
        String deptName,
        Integer gradeLevel,
        SurveyTargetStatus status,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime submittedAt
) {
}