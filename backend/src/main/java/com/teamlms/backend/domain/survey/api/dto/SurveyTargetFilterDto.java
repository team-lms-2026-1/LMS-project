package com.teamlms.backend.domain.survey.api.dto;

import com.teamlms.backend.domain.survey.enums.SurveyTargetGenType;
import java.util.List;

public record SurveyTargetFilterDto(
    SurveyTargetGenType genType,
    List<Long> deptIds,
    List<Long> userIds,
    List<Integer> gradeLevels
) {}
