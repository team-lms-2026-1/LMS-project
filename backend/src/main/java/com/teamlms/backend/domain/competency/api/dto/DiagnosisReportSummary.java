package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class DiagnosisReportSummary {
    private Integer targetCount;
    private Integer responseCount;
    private BigDecimal totalAverage;
}
