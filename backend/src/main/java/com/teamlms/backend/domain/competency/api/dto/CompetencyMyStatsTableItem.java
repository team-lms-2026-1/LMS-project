package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class CompetencyMyStatsTableItem {
    private String competencyName;
    private BigDecimal myScore;
    private BigDecimal avgScore;
    private BigDecimal maxScore;
}
