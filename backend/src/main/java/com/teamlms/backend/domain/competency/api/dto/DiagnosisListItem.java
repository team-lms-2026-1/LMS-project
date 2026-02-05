package com.teamlms.backend.domain.competency.api.dto;

import lombok.Getter;
import lombok.Builder;
import java.time.LocalDateTime;

@Getter
@Builder
public class DiagnosisListItem {
    private Long diagnosisId;
    private String title;
    private String targetGrade;
    private String semesterName;
    private String deptName;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;
    private String status;
}
