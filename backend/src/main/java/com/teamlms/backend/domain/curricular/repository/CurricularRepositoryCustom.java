package com.teamlms.backend.domain.curricular.repository;

import java.util.List;

import com.teamlms.backend.domain.curricular.entity.Curricular;

public interface CurricularRepositoryCustom {
    List<Curricular> findActiveByDeptIdForDropdown(Long deptId);
}
