package com.teamlms.backend.domain.competency.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import java.util.Map;

@Getter
public class DiagnosisQuestionRequest {

    private Long questionId; // 수정 시

    @NotBlank
    private String type; // SCALE or SHORT

    @NotBlank
    private String text;

    @NotNull
    @Min(1)
    private Integer order;

    @NotNull
    private Map<String, Integer> weights; // C1-C6
}
