package com.teamlms.backend.domain.extracurricular.api.dto;

import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;

public record AdminExtraOfferingApplicantSessionRow(
    Long applicationId,
    Long sessionId,
    String sessionTitle,
    ExtraSessionStatus sessionStatus,
    Boolean isAttended
) {}
