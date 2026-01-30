package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter; // Added
import lombok.ToString; // Added

import java.time.LocalDateTime;
import java.util.List;

// 1. 설문 생성
@Getter
@Setter // Added
@ToString // Added
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
    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    public static class QuestionDto {
        private String questionText;
        private Integer sortOrder;
        private Integer minVal = 1;
        private Integer maxVal = 5;
        private String minLabel;
        private String maxLabel;
        private Boolean isRequired = true;
    }

    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    public static class TargetFilterDto {
        private String genType; // ALL, DEPT, USER, GRADE
        private List<Long> deptIds;
        private List<Long> userIds;
        private List<Integer> gradeLevels; // [추가] 학년 대상
    }
}