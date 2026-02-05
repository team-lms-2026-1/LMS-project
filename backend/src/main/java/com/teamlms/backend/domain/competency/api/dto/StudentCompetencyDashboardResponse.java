package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class StudentCompetencyDashboardResponse {
    private StudentProfileInfo profile;
    private CompetencySummaryInfo summary;
    private List<CompetencyRadarItem> radarChart;
    private DiagnosisTrendChart trendChart;
    private List<CompetencyMyStatsTableItem> myStatsTable;
    private List<CompetencyComparisonTableItem> comparisonTable;
}
