package com.teamlms.backend.domain.competency.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import java.util.List;

@Getter
public class DiagnosisReminderRequest {

    private List<Long> targetIds;

    @NotNull
    private Boolean sendToAllPending;

    private String emailSubject;

    private String emailBody;
}
