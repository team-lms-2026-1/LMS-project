package com.teamlms.backend.domain.survey.api.dto;

import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InternalSurveySearchRequest {
    private SurveyType type;
    private SurveyStatus status;
    private String keyword;
}