package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.curricular.entity.Curricular;

public record DeptCurricularDropdownItem(
    Long curricularId,
    String curricularName
) {
    public static DeptCurricularDropdownItem from (Curricular c) {
        return new DeptCurricularDropdownItem(c.getCurricularId(), c.getCurricularName());
    }
}
