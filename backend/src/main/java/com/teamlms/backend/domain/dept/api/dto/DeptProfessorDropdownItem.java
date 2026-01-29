package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.account.entity.ProfessorProfile;

public record DeptProfessorDropdownItem(
    Long accountId,
    String name
) {
    public static DeptProfessorDropdownItem from (ProfessorProfile p) {
        return new DeptProfessorDropdownItem(p.getAccountId(), p.getName());
    }
}
