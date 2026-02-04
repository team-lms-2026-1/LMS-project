package com.teamlms.backend.domain.competency.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.util.List;

/**
 * 내부 DTO: 학기별 역량 통계 집계 데이터
 */
@Getter
@Builder
public class SemesterCompetencyAggregation {
    private Long semesterId;
    private Long competencyId;
    private Integer targetCount;
    private Integer calculatedCount;
    private List<BigDecimal> scores;
    private BigDecimal mean;
    private BigDecimal median;
    private BigDecimal stddev;
}
