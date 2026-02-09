package com.teamlms.backend.domain.extracurricular.api.dto;

import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;

import jakarta.validation.constraints.NotNull;

public record ExtraOfferingStatusChangeRequest(
        @NotNull ExtraOfferingStatus status
) {}