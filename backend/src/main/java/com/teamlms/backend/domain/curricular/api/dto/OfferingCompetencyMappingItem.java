package com.teamlms.backend.domain.curricular.api.dto;

public record OfferingCompetencyMappingItem(
        Long competencyId,
        String code,
        String name,
        String description,
        Integer weight   // 매핑 안 되어 있으면 null
) {}
