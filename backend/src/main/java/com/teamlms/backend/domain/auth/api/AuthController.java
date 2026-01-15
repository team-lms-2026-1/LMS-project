package com.teamlms.backend.domain.auth.api;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.auth.api.dto.AuthLoginRequest;
import com.teamlms.backend.domain.auth.api.dto.AuthLoginResponse;
import com.teamlms.backend.domain.auth.service.AuthService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.security.jwt.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ApiResponse<AuthLoginResponse> login(@Valid @RequestBody AuthLoginRequest request) {

        Account account = authService.login(request.getLoginId(), request.getPassword());

        String accessToken = jwtTokenProvider.createAccessToken(
                account.getAccountId(),
                account.getAccountType().name()
        );

        AuthLoginResponse response = AuthLoginResponse.builder()
                .accessToken(accessToken)
                .expiresInSeconds(jwtTokenProvider.getAccessTokenSeconds())
                .account(AuthLoginResponse.AccountSummary.builder()
                        .accountId(account.getAccountId())
                        .loginId(account.getLoginId())
                        .accountType(account.getAccountType().name())
                        .build())
                .build();

        return ApiResponse.ok(response);
    }
}
