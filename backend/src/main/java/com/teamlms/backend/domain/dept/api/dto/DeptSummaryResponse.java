package com.teamlms.backend.domain.dept.api.dto;

public record DeptSummaryResponse(
        Long departmentId,
        String departmentCode,
        String departmentName,
        String description,

        ChairProfessor chairProfessor,

        long professorCount,
        StudentCount studentCount,
        long majorCount
) {
    public record ChairProfessor(
            Long accountId,
            String name
    ) {}

    public record StudentCount(
            long enrolled,
            long leaveOfAbsence,
            long graduated
    ) {}
}