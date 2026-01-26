package com.teamlms.backend.domain.curricular.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record EnrollmentScoreUpdateRequest(
        @NotNull
        @Min(0)
        @Max(100)
        Integer rawScore
) {}
