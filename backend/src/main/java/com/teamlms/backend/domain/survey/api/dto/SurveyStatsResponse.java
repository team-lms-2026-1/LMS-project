package com.teamlms.backend.domain.survey.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SurveyStatsResponse {
    private Long surveyId;
    private long totalTargets;      // 전체 대상자 수
    private long submittedCount;    // 응답 완료 수
    private double responseRate;    // 응답률 (%)
}