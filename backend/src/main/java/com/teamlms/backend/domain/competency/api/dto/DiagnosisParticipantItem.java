package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiagnosisParticipantItem {
    private Long targetId;
    private String studentNumber;
    private String name;
    private String email;
    private Integer grade;
    private String deptName;
    private String status;
}
