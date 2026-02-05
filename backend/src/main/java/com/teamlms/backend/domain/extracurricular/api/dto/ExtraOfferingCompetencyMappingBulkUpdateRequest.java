package com.teamlms.backend.domain.extracurricular.api.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record ExtraOfferingCompetencyMappingBulkUpdateRequest(
    @NotEmpty List<@Valid ExtraOfferingCompetencyMappingPatchRequest> mappings

) {}
