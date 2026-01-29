package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

// 1. 목록 조회
@Getter
@Builder
public class SurveyListResponse {
    private Long surveyId;
    private SurveyType type;
    private String title;
    private SurveyStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime startAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime endAt;
}