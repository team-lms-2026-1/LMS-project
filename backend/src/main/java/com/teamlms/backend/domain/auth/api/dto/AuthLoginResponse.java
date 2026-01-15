package com.teamlms.backend.domain.auth.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthLoginResponse {
    private String accessToken;
    private long expiresInSeconds;

    private AccountSummary account;

    @Getter
    @Builder
    public static class AccountSummary {
        private Long accountId;
        private String loginId;
        private String accountType; // STUDENT | PROFESSOR | ADMIN
    }
}
