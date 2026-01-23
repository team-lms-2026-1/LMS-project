package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

// 2. 상세 조회
@Getter
@Builder
public class SurveyDetailResponse {
    private Long surveyId;
    private SurveyType type;
    private String title;
    private String description;
    private SurveyStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime startAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime endAt;

    private List<QuestionResponseDto> questions;

    @Getter @Builder
    public static class QuestionResponseDto {
        private Long questionId;
        private String questionText;
        private Integer sortOrder;
        private Integer minVal;
        private Integer maxVal;
        private String minLabel;
        private String maxLabel;
        private Boolean isRequired;
    }
}