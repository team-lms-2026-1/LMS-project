package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class DiagnosisBasicInfo {
    private Long diagnosisId;
    private String title;
    private Long semesterId;
    private Integer targetGrade;
    private Long deptId;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String status;
}
