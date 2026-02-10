package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record SurveyCreateRequest(
    @NotNull
    SurveyType type,
    
    @NotBlank
    String title,
    
    String description,

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime startAt,
    
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime endAt,

    @NotNull(message = "{validation.survey.questions.required}")
    @jakarta.validation.constraints.NotEmpty(message = "{validation.survey.questions.notEmpty}")
    @jakarta.validation.Valid
    private List<QuestionDto> questions;
    private TargetFilterDto targetFilter;

    // Inner DTOs
    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    public static class QuestionDto {
        @NotBlank(message = "{validation.survey.questionText.required}")
        private String questionText;
        private Integer sortOrder;
        private Integer minVal = 1;
        private Integer maxVal = 5;
        private String minLabel;
        private String maxLabel;

        private Boolean isRequired = true;

        // [New]
        private com.teamlms.backend.domain.survey.enums.SurveyQuestionType questionType;
        private List<String> options;
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
