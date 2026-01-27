package com.teamlms.backend.domain.extracurricular.api.dto;

public record ExtraCurricularPatchRequest(
    String extraCurricularName,
    String description,
    String hostOrgName,
    Boolean isActive
) {}
