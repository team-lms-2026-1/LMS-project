package com.teamlms.backend.domain.auth.dto;

import com.teamlms.backend.domain.account.entity.Account;

import java.util.Set;
// 
public record LoginResult(
        Account account,
        Set<String> permissionCodes
) {}
