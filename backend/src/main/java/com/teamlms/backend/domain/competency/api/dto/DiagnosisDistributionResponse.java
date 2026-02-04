package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiagnosisDistributionResponse {
    private Integer totalResponseCount;
    private java.util.List<CompetencyScoreDistributionItem> distribution;
}
