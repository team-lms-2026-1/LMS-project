package com.teamlms.backend.domain.extracurricular.api.dto;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricular;

public record ExtraCurricularDropdownItem(
    Long extraCurricularId,
    String name
) {
    public static ExtraCurricularDropdownItem from(ExtraCurricular e) {
        return new ExtraCurricularDropdownItem(e.getExtraCurricularId(), e.getExtraCurricularName());
    }
}
