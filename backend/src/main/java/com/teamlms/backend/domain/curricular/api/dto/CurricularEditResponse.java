package com.teamlms.backend.domain.curricular.api.dto;

import com.teamlms.backend.domain.curricular.entity.Curricular;

public record CurricularEditResponse(
    Long curricularId,
    String curricularCode,
    String curricularName,
    Long deptId,
    Integer credits,
    String description,
    Boolean isActive
) {
    public static CurricularEditResponse from(Curricular c) {
        return new CurricularEditResponse(
            c.getCurricularId(),
            c.getCurricularCode(),
            c.getCurricularName(),
            c.getDeptId(),
            c.getCredits(),
            c.getDescription(),
            c.getIsActive()
        );
    }
}
