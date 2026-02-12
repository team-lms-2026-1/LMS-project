package com.teamlms.backend.domain.alarm.api;

import com.teamlms.backend.domain.alarm.api.dto.AlarmResponse;
import com.teamlms.backend.domain.alarm.api.dto.AlarmUnreadCountResponse;
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;
import com.teamlms.backend.domain.alarm.service.AlarmQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/alarms")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmQueryService queryService;
    private final AlarmCommandService commandService;

    @GetMapping
    public ApiResponse<java.util.List<AlarmResponse>> getMyAlarms(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<AlarmResponse> result = queryService.getMyAlarms(user.getAccountId(), pageable);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    @GetMapping("/unread-count")
    public ApiResponse<AlarmUnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal AuthUser user
    ) {
        long unreadCount = queryService.getUnreadCount(user.getAccountId());
        return ApiResponse.ok(new AlarmUnreadCountResponse(unreadCount));
    }

    @PatchMapping("/{alarmId}/read")
    public ApiResponse<Map<String, Boolean>> markRead(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long alarmId
    ) {
        commandService.markRead(user.getAccountId(), alarmId);
        return ApiResponse.ok(Map.of("success", true));
    }

    @PatchMapping("/read-all")
    public ApiResponse<Map<String, Object>> markAllRead(
            @AuthenticationPrincipal AuthUser user
    ) {
        int updated = commandService.markAllRead(user.getAccountId());
        return ApiResponse.ok(Map.of("success", true, "updated", updated));
    }

    @DeleteMapping
    public ApiResponse<Map<String, Object>> deleteAll(
            @AuthenticationPrincipal AuthUser user
    ) {
        int deleted = commandService.deleteAll(user.getAccountId());
        return ApiResponse.ok(Map.of("success", true, "deleted", deleted));
    }

    @DeleteMapping("/{alarmId}")
    public ApiResponse<Map<String, Boolean>> deleteAlarm(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long alarmId
    ) {
        commandService.deleteAlarm(user.getAccountId(), alarmId);
        return ApiResponse.ok(Map.of("success", true));
    }
}
