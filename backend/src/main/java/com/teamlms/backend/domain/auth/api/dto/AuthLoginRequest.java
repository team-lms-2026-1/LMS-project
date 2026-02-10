package com.teamlms.backend.domain.auth.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;


// 학생/교수/관리자 공통
@Getter
@NoArgsConstructor
public class AuthLoginRequest {

    @NotBlank
    @Pattern(regexp = "^[spa]\\d{8}$", message = "{validation.auth.loginId.pattern}")
    private String loginId;

    @NotBlank
    private String password;
}
