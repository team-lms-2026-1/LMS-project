package com.teamlms.backend.domain.account.api;

import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateRequest;
import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateResponse;
import com.teamlms.backend.domain.account.api.dto.AdminAccountListItem;
import com.teamlms.backend.domain.account.api.dto.AdminAccountStatusUpdateRequest;
import com.teamlms.backend.domain.account.api.dto.AdminAccountStatusUpdateResponse;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.service.AccountCommandService;
import com.teamlms.backend.domain.account.service.AccountService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/accounts")
public class AdminAccountController {

    private final AccountCommandService accountCommandService;
    private final AccountService accountService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SuccessResponse> create(@Valid @RequestBody AdminAccountCreateRequest request, @AuthenticationPrincipal AuthUser authUser) {

        // 지금 로그인한 관리자 가져오기
        Long actorAccountId = authUser.getAccountId();
        
        accountCommandService.adminCreate(request, actorAccountId);

        return ApiResponse.ok(new SuccessResponse());
    }

    // status 변경
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

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<?> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AccountType accountType
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100); // 운영상 상한(원하면 제거)

        Pageable pageable = PageRequest.of(
                safePage - 1, // ✅ Spring Data는 0-based
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<AdminAccountListItem> result =
                accountService.adminList(keyword, accountType, pageable);

        // ✅ 페이징 응답 => of(data, meta)
        return ApiResponse.of(
                result.getContent(),
                PageMeta.from(result)
        );
    }
}
