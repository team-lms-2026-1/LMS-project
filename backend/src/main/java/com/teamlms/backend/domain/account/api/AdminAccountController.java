package com.teamlms.backend.domain.account.api;

import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateRequest;
import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateResponse;
import com.teamlms.backend.domain.account.api.dto.AdminAccountStatusUpdateRequest;
import com.teamlms.backend.domain.account.api.dto.AdminAccountStatusUpdateResponse;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.service.AccountCommandService;
import com.teamlms.backend.global.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/accounts")
public class AdminAccountController {

    private final AccountCommandService accountCommandService;

    /**
     * 관리자: 계정 생성
    h * POST /api/v1/admin/accounts
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminAccountCreateResponse> create(@Valid @RequestBody AdminAccountCreateRequest request) {

        // TODO: SecurityPrincipal 붙이면 actorAccountId로 교체
        Long actorAccountId = 1L;

        // 서비스는 account_id 리턴한다고 가정 (이전 답변의 adminCreate)
        Long accountId = accountCommandService.adminCreate(request, actorAccountId);

        AdminAccountCreateResponse response = new AdminAccountCreateResponse(
                true,
                accountId,
                request.getLoginId(),
                request.getAccountType()
        );

        return ApiResponse.ok(response);
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
