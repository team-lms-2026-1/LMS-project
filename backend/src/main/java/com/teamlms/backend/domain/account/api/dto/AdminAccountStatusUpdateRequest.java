package com.teamlms.backend.domain.account.api.dto;

import com.teamlms.backend.domain.account.enums.AccountStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminAccountStatusUpdateRequest {

    @NotNull
    private AccountStatus status; // ACTIVE | INACTIVE
}
