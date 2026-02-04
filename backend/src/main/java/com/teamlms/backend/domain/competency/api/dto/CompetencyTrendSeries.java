package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CompetencyTrendSeries {
    private String name;
    private List<BigDecimal> data;
}
