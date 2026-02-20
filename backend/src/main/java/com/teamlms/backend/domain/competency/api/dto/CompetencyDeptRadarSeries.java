package com.teamlms.backend.domain.competency.api.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompetencyDeptRadarSeries {
    private String deptName;
    private List<CompetencyRadarItem> items;
}
