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

    @NotNull
    @NotEmpty
    @Valid
    List<SurveyQuestionDto> questions,
    
    SurveyTargetFilterDto targetFilter
) {}