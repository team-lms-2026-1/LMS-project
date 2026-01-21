package com.teamlms.backend.domain.log.repository.projection;

import java.time.LocalDateTime;

/**
 * DB 조회 결과를 담는 Projection (Repository 전용)
 * - 엔티티가 아닌 "SELECT 결과"를 받기 위한 인터페이스
 */
public interface UserActivityRow {
    Long getAccountId();
    String getLoginId();
    String getAccountType();
    String getName();
    LocalDateTime getLastActivityAt();
    Boolean getIsOnline();
}
