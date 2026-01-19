package com.teamlms.backend.domain.dept.api.dto;

public record DeptListItem(
        Long deptId,
        String deptCode,
        String deptName,
        String headProfessorName,
        long studentCount,
        long professorCount,
        boolean isActive
) {}
