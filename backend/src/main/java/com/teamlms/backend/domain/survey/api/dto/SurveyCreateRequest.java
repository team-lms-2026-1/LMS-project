package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

// 1. 설문 생성
@Getter
@Setter
@ToString
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

    @NotNull(message = "질문 목록은 필수입니다")
    @NotEmpty(message = "질문을 하나 이상 추가해주세요")
    @Valid
    private List<SurveyQuestionDto> questions;
    private SurveyTargetFilterDto targetFilter;
}