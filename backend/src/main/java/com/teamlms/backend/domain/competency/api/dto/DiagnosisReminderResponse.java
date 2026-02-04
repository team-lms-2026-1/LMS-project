package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiagnosisReminderResponse {
    private Integer sentCount;
    private Integer failedCount;
}
