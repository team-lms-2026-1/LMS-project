package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.dept.entity.Major;

public record DeptMajorDropdownItem(
    Long majorId,
    String name
) {
    public static DeptMajorDropdownItem from(Major m) {
        return new DeptMajorDropdownItem(m.getMajorId(), m.getMajorName());
    }
}