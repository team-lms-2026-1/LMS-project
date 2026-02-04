package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class DiagnosisReportResponse {
    private DiagnosisReportSummary summary;
    private List<CompetencyRadarItem> radarChart;
    private DiagnosisTrendChart trendChart;
    private List<CompetencyStatsTableItem> statsTable;
}
