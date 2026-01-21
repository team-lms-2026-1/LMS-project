package com.teamlms.backend.domain.dept.repository;

import java.util.List;

import com.teamlms.backend.domain.dept.entity.Major;

public interface MajorRepositoryCustom {
    List<Major> findActiveForDropdownByDeptId(Long deptId);

    List<Major> findActiveForDropdown();
}
