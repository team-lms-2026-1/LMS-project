package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.Map;

@Getter
@Builder
public class DiagnosisQuestionDetail {
    private Long questionId;
    private String type;
    private String text;
    private Integer order;
    private Map<String, Integer> weights;
}
