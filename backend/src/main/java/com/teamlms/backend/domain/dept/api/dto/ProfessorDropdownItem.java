package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.account.entity.ProfessorProfile;

public record ProfessorDropdownItem(
        Long accountId,
        String name
) {
    public static ProfessorDropdownItem from(ProfessorProfile p) {
        return new ProfessorDropdownItem(
                p.getAccountId(),
                p.getName()
        );
    }
}
