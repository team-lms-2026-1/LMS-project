package com.teamlms.backend.domain.survey.api.dto;

import lombok.Builder;

@Builder
public record SurveyTypeResponse(
    String typeCode,
    String typeName
) {}
