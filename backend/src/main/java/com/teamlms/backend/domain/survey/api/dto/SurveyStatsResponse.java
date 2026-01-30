package com.teamlms.backend.domain.survey.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.Map;

@Getter
@Builder
public class SurveyStatsResponse {
    private Long surveyId;
    private long totalTargets; // 전체 대상자 수
    private long submittedCount; // 응답 완료 수
    private double responseRate; // 응답률 (%)

    // 추가: 부서별/학년별 통계
    private Map<String, Long> responseByDept; // 부서명 -> 응답수
    private Map<String, Long> responseByGrade; // 학년 -> 응답수 (1학년, 2학년...)
}