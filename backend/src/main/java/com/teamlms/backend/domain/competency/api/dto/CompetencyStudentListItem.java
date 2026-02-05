package com.teamlms.backend.domain.competency.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompetencyStudentListItem {
    private Long accountId;
    private String studentNumber;
    private String deptName;
    private Integer grade;
    private String name;
}
