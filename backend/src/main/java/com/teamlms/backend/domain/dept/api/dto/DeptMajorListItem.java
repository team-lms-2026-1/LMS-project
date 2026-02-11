package com.teamlms.backend.domain.dept.api.dto;

public record DeptMajorListItem(
    Long majorId,
    String majorCode,
    String majorName,
    long enrolledStudentCount,
    boolean isActive
) {}
