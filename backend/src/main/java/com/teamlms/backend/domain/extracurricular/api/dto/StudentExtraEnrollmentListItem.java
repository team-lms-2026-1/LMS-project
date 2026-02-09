package com.teamlms.backend.domain.extracurricular.api.dto;

import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;

public record StudentExtraEnrollmentListItem(
    Long extraOfferingId,
    String extraOfferingCode,
    String extraOfferingName,
    String hostContactName,
    String semesterName,
    Long rewardPointDefault,
    Long recognizedHoursDefault,
    ExtraOfferingStatus status
) {}
