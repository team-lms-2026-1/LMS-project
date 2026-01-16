package com.teamlms.backend.domain.account.api.dto;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAdminAccountDetailResponse {
    
    private Long accountId;
    private String loginId;
    private AccountType accountType; // admin
    private AccountStatus status;
    private LocalDateTime createdAt;
    
    private Profile profile;

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Profile {
        private String name;
        private String email;
        private String phone;
        private String memo;
    }
}
