package com.teamlms.backend.domain.curricular.api.dto;

public record CurricularPatchRequest(
    String curricularName,
    Long deptId,
    Integer credits,
    String description,
    Boolean isActive
) {}
