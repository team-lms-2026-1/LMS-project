package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class CompetencyScoreDistributionItem {
    private String competencyCode;
    private BigDecimal score;
    private String studentName;
    private String studentHash;
}
