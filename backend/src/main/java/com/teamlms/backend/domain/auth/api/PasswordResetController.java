package com.teamlms.backend.domain.auth.api;

import com.teamlms.backend.domain.auth.api.dto.PasswordResetConfirmRequest;
import com.teamlms.backend.domain.auth.api.dto.PasswordResetConfirmResponse;
import com.teamlms.backend.domain.auth.api.dto.PasswordResetRequest;
import com.teamlms.backend.domain.auth.api.dto.PasswordResetRequestResponse;
import com.teamlms.backend.domain.auth.service.PasswordResetService;
import com.teamlms.backend.global.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth/password-reset")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/request")
    public ApiResponse<PasswordResetRequestResponse> request(
            @Valid @RequestBody PasswordResetRequest requestBody,
            HttpServletRequest request
    ) {
        passwordResetService.requestReset(requestBody.getEmail(), request.getRemoteAddr());
        return ApiResponse.ok(new PasswordResetRequestResponse(true));
    }

    @PostMapping("/confirm")
    public ApiResponse<PasswordResetConfirmResponse> confirm(
            @Valid @RequestBody PasswordResetConfirmRequest requestBody
    ) {
        passwordResetService.confirmReset(requestBody.getToken(), requestBody.getNewPassword());
        return ApiResponse.ok(new PasswordResetConfirmResponse(true));
    }
}
