package com.teamlms.backend.domain.curricular.api.dto;

import com.teamlms.backend.domain.curricular.enums.OfferingStatus;

import jakarta.validation.constraints.NotNull;

public record CurricularOfferingStatusChangeRequest(
    @NotNull
    OfferingStatus status
) {}
