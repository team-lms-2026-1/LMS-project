package com.teamlms.backend.domain.log.api;

import com.teamlms.backend.domain.log.api.dto.UserActivityListItem;
import com.teamlms.backend.domain.log.api.dto.UserActivityListResponse;
import com.teamlms.backend.domain.log.api.dto.UserActivitySummary;
import com.teamlms.backend.domain.log.service.UserActivityQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('LOG_MANAGE')")
@RequestMapping("/api/v1/admin/user-activity")
public class UserActivityAdminController {

    private final UserActivityQueryService userActivityQueryService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<?> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "lastActivityAt")
        );

        Page<UserActivityListItem> result = userActivityQueryService.list(keyword, pageable);
        UserActivitySummary summary = userActivityQueryService.summary(keyword);

        UserActivityListResponse data = new UserActivityListResponse(result.getContent(), summary);

        return ApiResponse.of(data, PageMeta.from(result));
    }

    @GetMapping("/{accountId}/access-logs")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<?> accessLogs(
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "accessedAt")
        );

        var result = userActivityQueryService.accessLogsDetail(accountId, pageable);

        return ApiResponse.of(
                result.data(),
                PageMeta.from(result.page())
        );
    }
}
