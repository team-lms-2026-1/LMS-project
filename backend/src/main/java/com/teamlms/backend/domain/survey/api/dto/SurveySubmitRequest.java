package com.teamlms.backend.domain.survey.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record SurveySubmitRequest(
    @NotNull
    Long surveyId,

    @NotNull
    Map<String, Object> responses // Key:문항ID, Value:답변
) {}