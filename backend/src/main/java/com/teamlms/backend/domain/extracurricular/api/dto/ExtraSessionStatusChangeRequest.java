package com.teamlms.backend.domain.extracurricular.api.dto;

import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;

import jakarta.validation.constraints.NotNull;

public record ExtraSessionStatusChangeRequest(
    @NotNull ExtraSessionStatus targetStatus
) {}
