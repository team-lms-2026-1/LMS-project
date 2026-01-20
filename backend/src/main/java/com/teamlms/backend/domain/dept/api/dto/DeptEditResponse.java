package com.teamlms.backend.domain.dept.api.dto;

import java.util.List;

public record DeptEditResponse(
        DeptUpdateFormResponse dept,
        List<ProfessorDropdownItem> professors
) {}
