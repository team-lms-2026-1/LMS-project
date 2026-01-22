package com.teamlms.backend.domain.semester.api.dto;

import com.teamlms.backend.domain.semester.entity.Semester;

public record SemesterDropdownItem(
        Long semesterId,
        String displayName
) {
    public static SemesterDropdownItem from(Semester s) {
        String display = s.getYear() + "-" + s.getTerm().shortCode();
        return new SemesterDropdownItem(s.getSemesterId(), display);
    }
}
