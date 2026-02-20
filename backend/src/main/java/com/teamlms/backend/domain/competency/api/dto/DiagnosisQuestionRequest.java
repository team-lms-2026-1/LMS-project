package com.teamlms.backend.domain.competency.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisQuestionRequest {

    private Long questionId; // 수정 시

    private String type; // SCALE or SHORT (Problem에서 상속 가능)

    private String domain; // SKILL or APTITUDE

    @NotBlank
    private String text; // 문항 내용

    @NotNull
    @Min(1)
    private Integer order;

    // --- 선택지별 개별 설정 (필요시) ---
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

    // --- 역량별 가중치 개별 설정 (필요시) ---
    private Integer c1;
    private Integer c2;
    private Integer c3;
    private Integer c4;
    private Integer c5;
    private Integer c6;

    // --- 단답형(SHORT) 개별 정답 (필요시) ---
    private String shortAnswerKey;
}
