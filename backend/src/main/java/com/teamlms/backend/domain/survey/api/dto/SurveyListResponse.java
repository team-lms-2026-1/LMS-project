package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record SurveyListResponse(
    Long surveyId,
    SurveyType type,
    String title,
    SurveyStatus status, // This will be the "Display Status"
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime startAt,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime endAt,
    Long viewCount,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime createdAt,
    Boolean isSubmitted
) {}
