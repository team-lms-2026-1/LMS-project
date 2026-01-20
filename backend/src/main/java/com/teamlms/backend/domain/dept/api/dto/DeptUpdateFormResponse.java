package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.dept.entity.Dept;

public record DeptUpdateFormResponse(
        Long deptId,
        String deptCode,
        String deptName,
        Long headProfessorAccountId,
        String description
) {
    public static DeptUpdateFormResponse from(Dept d) {
        return new DeptUpdateFormResponse(
                d.getDeptId(),
                d.getDeptCode(),
                d.getDeptName(),
                d.getHeadProfessorAccountId(),
                d.getDescription()
        );
    }
}
