package com.teamlms.backend.domain.competency.api.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompetencyResultDashboardResponse {
    private DiagnosisReportSummary summary;
    private List<CompetencyDeptRadarSeries> radarChart;
    private DiagnosisTrendChart trendChart;
    private List<CompetencyStatsTableItem> statsTable;
}
