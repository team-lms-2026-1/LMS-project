package com.teamlms.backend.domain.competency.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.Map;

/**
 * 내부 DTO: 진단 문항 수정 데이터
 */
@Getter
@Builder
public class DiagnosisQuestionUpdate {
    private Long questionId; // null이면 신규
    private String type;
    private String text;
    private Integer order;
    private Map<String, Integer> competencyWeights;
}
