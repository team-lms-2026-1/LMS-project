package com.teamlms.backend.domain.survey.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.Map;

// 2. 응답 제출
@Getter
@NoArgsConstructor
public class SurveySubmitRequest {
    @NotNull
    private Long surveyId;

    @NotNull

    private Map<String, Object> responses; // Key:문항ID, Value:답변(점수Int, 문자열String, Checkbox List 등)
}