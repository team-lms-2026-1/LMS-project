package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class DiagnosisCreateResponse {
    private Long diagnosisId;
    private String status;
    private LocalDateTime createdAt;
}
