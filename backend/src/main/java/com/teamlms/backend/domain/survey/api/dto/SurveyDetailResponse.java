package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record SurveyDetailResponse(
        Long surveyId,
        SurveyType type,
        String title,
        String description,
        SurveyStatus status,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime startAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime endAt,
        SurveyTargetFilterDto targetFilter,
        List<QuestionResponseDto> questions
) {
    @Builder
    public record QuestionResponseDto(
            Long questionId,
            String questionText,
            Integer sortOrder,
            Integer minVal,
            Integer maxVal,
            String minLabel,
            String maxLabel,
            Boolean isRequired,
            com.teamlms.backend.domain.survey.enums.SurveyQuestionType questionType,
            List<String> options
    ) {
    }
}