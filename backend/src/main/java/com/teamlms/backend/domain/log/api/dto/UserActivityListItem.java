package com.teamlms.backend.domain.log.api.dto;

import java.time.LocalDateTime;

/**
 * 관리자 화면: 사용자 활동(온라인) 목록 Row DTO
 */
public record UserActivityListItem(
        Long accountId,
        String loginId,
        String accountType,
        String name,
        LocalDateTime lastActivityAt,
        boolean isOnline
) {
}
