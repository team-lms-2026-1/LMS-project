package com.teamlms.backend.domain.competency.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    @JsonProperty("short_answer_key")
    private String shortAnswerKey;
    private String label1;
    private String label2;
    private String label3;
    private String label4;
    private String label5;
    private Integer score1;
    private Integer score2;
    private Integer score3;
    private Integer score4;
    private Integer score5;
}
