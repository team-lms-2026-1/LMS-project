package com.teamlms.backend.domain.competency.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisProblemRequest {

    @NotBlank
    private String type; // SCALE or SHORT

    @NotBlank
    private String title; // 문제 제목

    private String domain; // SKILL or APTITUDE

    private Integer order;

    // --- 공통 6cs 가중치 (문제당 1개씩) ---
    private Integer c1;
    private Integer c2;
    private Integer c3;
    private Integer c4;
    private Integer c5;
    private Integer c6;

    // --- 공통 선택지 정의 (SCALE 타입일 때 하위 문항에 전파) ---
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

    // --- 단답형(SHORT) 전용 필드 ---
    private String shortAnswerKey; // 정답

    // --- 객관식(SCALE) 전용 필드 ---
    private List<DiagnosisQuestionRequest> items; // 계층형 문항 리스트
}
