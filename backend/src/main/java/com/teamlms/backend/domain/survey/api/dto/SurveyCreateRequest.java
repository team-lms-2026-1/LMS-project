package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// 1. 설문 생성
@Getter
@NoArgsConstructor
public class SurveyCreateRequest {
    @NotNull
    private SurveyType type;
    @NotBlank
    private String title;
    private String description;
    
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime startAt;
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime endAt;

    private List<QuestionDto> questions;
    private TargetFilterDto targetFilter;

    // Inner DTOs
    @Getter @NoArgsConstructor
    public static class QuestionDto {
        private String questionText;
        private Integer sortOrder;
        private Integer minVal = 1;
        private Integer maxVal = 5;
        private String minLabel;
        private String maxLabel;
        private Boolean isRequired = true;
    }

    @Getter @NoArgsConstructor
    public static class TargetFilterDto {
        private String genType; // ALL, DEPT, USER
        private List<Long> deptIds;
        private List<Long> userIds;
    }
}