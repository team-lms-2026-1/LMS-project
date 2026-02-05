package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class DiagnosisTrendChart {
    private List<String> categories;
    private List<CompetencyTrendSeries> series;
}
