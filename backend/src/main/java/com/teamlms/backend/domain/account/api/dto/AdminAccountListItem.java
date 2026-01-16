package com.teamlms.backend.domain.account.api.dto;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminAccountListItem {
    private Long accountId;
    private String loginId;
    private String name;
    private String email;
    private AccountType accountType;
    private AccountStatus status;
    private LocalDateTime createdAt;
}