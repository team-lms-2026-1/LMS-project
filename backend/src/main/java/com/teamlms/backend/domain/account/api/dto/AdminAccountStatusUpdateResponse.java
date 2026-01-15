package com.teamlms.backend.domain.account.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminAccountStatusUpdateResponse {
    private boolean success;
    private Long accountId;
    private String status;
}
