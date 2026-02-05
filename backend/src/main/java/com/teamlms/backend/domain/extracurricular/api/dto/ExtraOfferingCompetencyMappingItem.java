package com.teamlms.backend.domain.extracurricular.api.dto;

public record ExtraOfferingCompetencyMappingItem(
    Long competencyId,
    String code,
    String name,
    String description,
    Integer weight   // 매핑 안 되어 있으면 null
) {}
