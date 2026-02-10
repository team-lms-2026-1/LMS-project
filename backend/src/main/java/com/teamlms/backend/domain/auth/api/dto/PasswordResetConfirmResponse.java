package com.teamlms.backend.domain.auth.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PasswordResetConfirmResponse {
    private final boolean reset;
}
