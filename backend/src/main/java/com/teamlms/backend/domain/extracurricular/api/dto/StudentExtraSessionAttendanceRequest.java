package com.teamlms.backend.domain.extracurricular.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StudentExtraSessionAttendanceRequest(
    @NotNull @Min(0) Integer watchedSeconds
) {}
