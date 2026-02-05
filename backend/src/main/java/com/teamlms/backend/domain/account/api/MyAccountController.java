package com.teamlms.backend.domain.account.api;

import com.teamlms.backend.domain.account.api.dto.MyProfileResponse;
import com.teamlms.backend.domain.account.service.AccountService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.security.principal.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/accounts/me")
public class MyAccountController {

    private final AccountService accountService;

    @GetMapping
    public ApiResponse<MyProfileResponse> getMyProfile(@AuthenticationPrincipal AuthUser authUser) {
        MyProfileResponse response = accountService.getMyProfile(authUser.getAccountId());
        return ApiResponse.ok(response);
    }
}
