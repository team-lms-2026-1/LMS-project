package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StudentProfileInfo {
    private String name;
    private String studentNumber;
    private String deptName;
    private Integer grade;
}
