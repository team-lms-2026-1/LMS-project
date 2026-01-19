package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.dept.entity.Dept;

public record DepartmentDropdownItem(
    Long departmentId,
    String name
) {
    public static DepartmentDropdownItem from(Dept d) {
        return new DepartmentDropdownItem(d.getDeptId(), d.getDeptName());
    }
}