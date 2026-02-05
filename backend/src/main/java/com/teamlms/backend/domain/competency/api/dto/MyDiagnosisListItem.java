package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class MyDiagnosisListItem {
    private Long diagnosisId;
    private String title;
    private String semesterName;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String status; // PENDING | SUBMITTED
}
