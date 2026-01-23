package com.teamlms.backend.domain.curricular.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OfferingCompetencyMappingPatchRequest(
        @NotNull Long
        competencyId,
        
        @NotNull @Min(1) @Max(6) Integer
        weight
) {}
