package com.teamlms.backend.domain.competency.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.Map;

/**
 * 내부 DTO: 진단 응답 처리를 위한 데이터
 */
@Getter
@Builder
public class DiagnosisAnswerProcessing {
    private Long submissionId;
    private Long questionId;
    private Long studentAccountId;
    private String questionType;
    private Integer scaleValue;
    private String shortText;
    private Map<String, Integer> competencyWeights; // C1-C6 가중치
}
