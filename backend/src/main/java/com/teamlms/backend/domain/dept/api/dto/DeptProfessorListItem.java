package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.account.entity.ProfessorProfile;

public record DeptProfessorListItem(
    Long accountId,
    String professorNo,
    String name,
    String email,
    String phone
) {
    public static DeptProfessorListItem from(ProfessorProfile p) {
        return new DeptProfessorListItem(
            p.getAccountId(),
            p.getProfessorNo(),
            p.getName(),
            p.getEmail(),
            p.getPhone()
        );
    }
}
