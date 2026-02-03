package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import java.util.Map;
import java.util.List;

@Getter
@Builder
public class SurveyStatsResponse {
    private Long surveyId;
    private long totalTargets; // 전체 대상자 수
    private long submittedCount; // 응답 완료 수
    private double responseRate; // 응답률 (%)

    // 추가: 설문 정보
    private String title;
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private java.time.LocalDateTime startAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private java.time.LocalDateTime endAt;

    // 추가: 부서별/학년별 통계
    private Map<String, Long> responseByDept; // 부서명 -> 응답수
    private Map<String, Long> responseByGrade; // 학년 -> 응답수 (1학년, 2학년...)

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private java.time.LocalDateTime createdAt;

    private List<QuestionStats> questions;

    @Getter
    @Builder
    public static class QuestionStats {
        private Long questionId;
        private String title;
        private com.teamlms.backend.domain.survey.enums.SurveyQuestionType type;
        private Map<String, Long> answerCounts; // 선택지/점수별 응답 수
        private List<String> essayAnswers; // 주관식 응답 목록
    }
}