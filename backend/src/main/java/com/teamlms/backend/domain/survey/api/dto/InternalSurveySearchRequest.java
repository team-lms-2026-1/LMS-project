package com.teamlms.backend.domain.survey.api.dto;

import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import lombok.Builder;

@Builder
public record InternalSurveySearchRequest(
    SurveyType type,
    SurveyStatus status,
    String keyword
) {}