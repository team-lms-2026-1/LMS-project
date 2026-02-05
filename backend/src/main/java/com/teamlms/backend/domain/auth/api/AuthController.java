package com.teamlms.backend.domain.auth.api;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.auth.api.dto.AuthLoginRequest;
import com.teamlms.backend.domain.auth.api.dto.AuthLoginResponse;
import com.teamlms.backend.domain.auth.api.dto.AuthMeResponse;
import com.teamlms.backend.domain.auth.dto.LoginResult;
import com.teamlms.backend.domain.auth.service.AuthMeService;
import com.teamlms.backend.domain.auth.service.AuthService;
import com.teamlms.backend.domain.log.service.LogCommandService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.security.jwt.JwtTokenProvider;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

        private final AuthService authService;
        private final AuthMeService authMeService;
        private final JwtTokenProvider jwtTokenProvider;
        private final LogCommandService logCommandService;

        @PostMapping("/login")
        public ApiResponse<AuthLoginResponse> login(
                        @Valid @RequestBody AuthLoginRequest requestBody,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                LoginResult result = authService.login(requestBody.getLoginId(), requestBody.getPassword());
                Account account = result.account();

                String accessToken = jwtTokenProvider.createAccessToken(
                                result.account().getAccountId(),
                                result.account().getAccountType().name(),
                                result.permissionCodes());

                // 로그인 성공 시 로그 기록 (접속 이력 + 최근 활동)
                logCommandService.saveAccountAccessLog(account.getAccountId(), request, response);
                logCommandService.upsertUserActivity(account.getAccountId(), request);

                AuthLoginResponse loginResponse = AuthLoginResponse.builder()
                                .accessToken(accessToken)
                                .expiresInSeconds(jwtTokenProvider.getAccessTokenSeconds())
                                .account(AuthLoginResponse.AccountSummary.builder()
                                                .accountId(account.getAccountId())
                                                .loginId(account.getLoginId())
                                                .accountType(account.getAccountType().name())
                                                .build())
                                .build();

                return ApiResponse.ok(loginResponse);
        }

        @GetMapping("/me")
        public ApiResponse<AuthMeResponse> me(@AuthenticationPrincipal AuthUser user) {
                AuthMeResponse response = authMeService.me(user.getAccountId());
                return ApiResponse.ok(response);
        }
}
