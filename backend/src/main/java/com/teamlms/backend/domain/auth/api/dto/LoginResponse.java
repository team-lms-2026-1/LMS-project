package com.teamlms.backend.domain.auth.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private long expiresInSeconds;
    private AccountSummary account;

    @Getter
    @AllArgsConstructor
    public static class AccountSummary {
        private Long accountId;
        private String loginId;
        private String accountType;
    }
}
