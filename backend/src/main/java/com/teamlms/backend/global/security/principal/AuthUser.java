package com.teamlms.backend.global.security.principal;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthUser {
    private Long accountId;
    private String accountType; // STUDENT/PROFESSOR/ADMIN
}
