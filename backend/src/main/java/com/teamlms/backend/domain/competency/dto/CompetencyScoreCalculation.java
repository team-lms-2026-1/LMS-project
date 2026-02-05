package com.teamlms.backend.domain.competency.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

/**
 * 내부 DTO: 역량별 점수 계산 결과
 */
@Getter
@Builder
public class CompetencyScoreCalculation {
    private Long competencyId;
    private String competencyCode;
    private BigDecimal skillScore;
    private BigDecimal aptitudeScore;
    private BigDecimal totalScore;
}
