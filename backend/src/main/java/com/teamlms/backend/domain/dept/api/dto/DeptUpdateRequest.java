package com.teamlms.backend.domain.dept.api.dto;

import jakarta.validation.constraints.NotBlank;

public record DeptUpdateRequest(
        @NotBlank String deptName,
        Long headProfessorAccountId,
        String description
) {}
