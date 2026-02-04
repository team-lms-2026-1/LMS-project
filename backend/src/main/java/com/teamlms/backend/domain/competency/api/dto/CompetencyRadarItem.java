package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class CompetencyRadarItem {
    private String label;
    private BigDecimal score;
}
