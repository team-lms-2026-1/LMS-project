package com.teamlms.backend.domain.account.repository;

import com.teamlms.backend.domain.account.entity.ProfessorProfile;
import java.util.List;

public interface ProfessorProfileRepositoryCustom {
    List<ProfessorProfile> findActiveByDeptIdForDropdown(Long deptId);
}
