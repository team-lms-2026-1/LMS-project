package com.teamlms.backend.domain.competency.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

/**
 * 내부 DTO: 학생별 학기별 역량 요약 계산 데이터
 */
@Getter
@Builder
public class StudentCompetencySummaryData {
    private Long studentAccountId;
    private Long semesterId;
    private Long competencyId;
    private BigDecimal diagnosisSkillScore;
    private BigDecimal diagnosisAptitudeScore;
    private BigDecimal diagnosisScore;
    private BigDecimal curricularScore;
    private BigDecimal extraScore;
    private BigDecimal selfExtraScore;
    private BigDecimal totalScore;
}
