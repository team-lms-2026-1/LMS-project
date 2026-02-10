package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

import java.util.Map;
import java.util.List;

@Builder
public record SurveyStatsResponse(
        Long surveyId,
        long totalTargets,
        long submittedCount,
        double responseRate,
        String title,
        String description,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        java.time.LocalDateTime startAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        java.time.LocalDateTime endAt,
        Map<String, Long> responseByDept,
        Map<String, Long> responseByGrade,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        java.time.LocalDateTime createdAt,
        List<QuestionStats> questions
) {
    @Builder
    public record QuestionStats(
            Long questionId,
            String title,
            com.teamlms.backend.domain.survey.enums.SurveyQuestionType type,
            Map<String, Long> answerCounts,
            List<String> essayAnswers
    ) {
    }
}