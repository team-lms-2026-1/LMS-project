package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.dept.entity.Major;

public record MajorDropdownItem(
    Long majorId,
    String name
) {
    public static MajorDropdownItem from(Major m) {
        return new MajorDropdownItem(m.getMajorId(), m.getMajorName());
    }
}