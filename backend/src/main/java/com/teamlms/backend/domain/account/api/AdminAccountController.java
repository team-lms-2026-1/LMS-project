package com.teamlms.backend.domain.account.api;

import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateRequest;
import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateResponse;
import com.teamlms.backend.domain.account.api.dto.AdminAccountStatusUpdateRequest;
import com.teamlms.backend.domain.account.api.dto.AdminAccountStatusUpdateResponse;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.service.AccountCommandService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/accounts")
public class AdminAccountController {

    private final AccountCommandService accountCommandService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SuccessResponse> create(@Valid @RequestBody AdminAccountCreateRequest request, @AuthenticationPrincipal AuthUser authUser) {

        // 지금 로그인한 관리자 가져오기
        Long actorAccountId = authUser.getAccountId();
        
        accountCommandService.adminCreate(request, actorAccountId);

        return ApiResponse.ok(new SuccessResponse());
    }

    @PatchMapping("/{accountId}/status")
    public ApiResponse<AdminAccountStatusUpdateResponse> updateStatus(
            @PathVariable Long accountId,
            @Valid @RequestBody AdminAccountStatusUpdateRequest request
    ) {
        Long actorAccountId = 1L; // Todo @authenticationPrincipal 로 이후교체

        Account updated = accountCommandService.updateStatus(accountId, request.getStatus(), actorAccountId);

        AdminAccountStatusUpdateResponse response = new AdminAccountStatusUpdateResponse(true, updated.getAccountId(), updated.getStatus().name());

        return ApiResponse.ok(response);
    }
}
