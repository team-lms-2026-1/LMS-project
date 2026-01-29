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
    private Map<String, Integer> responses; // Key:문항ID, Value:점수
}