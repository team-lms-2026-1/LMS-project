package com.teamlms.backend.domain.curricular.api.dto;

public record CurricularListItem(
    Long curricularId,
    String curricularCode,
    String curricularName,
    Long deptId,
    Integer credits,
    Boolean isActive,

    String deptName
) {
    
}
