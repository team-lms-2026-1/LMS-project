package com.teamlms.backend.domain.curricular.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record OfferingCompetencyMappingBulkUpdateRequest(
        @NotEmpty List<@Valid OfferingCompetencyMappingPatchRequest> mappings
) {}
