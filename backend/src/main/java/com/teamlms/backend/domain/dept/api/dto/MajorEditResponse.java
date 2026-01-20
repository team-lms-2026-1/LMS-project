package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.dept.entity.Major;

public record MajorEditResponse(
    Long majorId,
    String majorCode,
    String majorName,
    String description
) {
    public static MajorEditResponse from(Major m) {
        return new MajorEditResponse(
            m.getMajorId(),
            m.getMajorCode(),
            m.getMajorName(),
            m.getDescription()
        );
    }
}
