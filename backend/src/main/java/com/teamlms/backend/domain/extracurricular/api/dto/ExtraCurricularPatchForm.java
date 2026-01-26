package com.teamlms.backend.domain.extracurricular.api.dto;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricular;

public record ExtraCurricularPatchForm(
    Long extraCurricularId,
    String extraCurricularCode,
    String extraCurricularName,
    String description,
    String hostOrgName,
    Boolean isActive
) {
    public static ExtraCurricularPatchForm from(ExtraCurricular e) {
        return new ExtraCurricularPatchForm (
            e.getExtraCurricularId(),
            e.getExtraCurricularCode(),
            e.getExtraCurricularName(),
            e.getDescription(),
            e.getHostOrgName(),
            e.getIsActive()
        );
    }
}