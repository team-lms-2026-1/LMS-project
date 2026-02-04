package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class CompetencyStatsTableItem {
    private String competencyName;
    private Integer targetCount;
    private Integer responseCount;
    private BigDecimal mean;
    private BigDecimal median;
    private BigDecimal stdDev;
    private LocalDateTime updatedAt;
}
