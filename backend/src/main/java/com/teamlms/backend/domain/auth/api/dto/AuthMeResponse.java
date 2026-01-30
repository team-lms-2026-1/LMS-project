package com.teamlms.backend.domain.auth.api.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthMeResponse {
    private Long accountId;
    private String loginId;
    private String accountType;
    private List<String> permissionCodes;
}
