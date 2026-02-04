package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class CompetencySummaryInfo {
    private BigDecimal maxScore;
    private BigDecimal recentAvg;
    private LocalDateTime lastEvaluationDate;
}
