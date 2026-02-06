package com.teamlms.backend.domain.survey.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class SurveyTargetFilterDto {
    private String genType; // ALL, DEPT, USER, GRADE, DEPT_GRADE
    private List<Long> deptIds;
    private List<Long> userIds;
    private List<Integer> gradeLevels;
}
