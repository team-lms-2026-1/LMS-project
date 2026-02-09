package com.teamlms.backend.domain.extracurricular.api.dto;

import com.teamlms.backend.domain.extracurricular.enums.CompletionStatus;

public record StudentExtraCompletionListItem(
    Long applicationId,
    Long semesterId,
    String semesterName,
    String extraOfferingCode,
    String extraOfferingName,
    Long rewardPointDefault,
    Long recognizedHoursDefault,
    CompletionStatus completionStatus
) {}
