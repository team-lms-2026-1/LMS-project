package com.teamlms.backend.domain.log.repository.projection;

import java.time.LocalDateTime;

/** 접근 로그 목록용 Projection (Repository 전용) */
public interface AccountAccessLogRow {
    Long getLogId();
    LocalDateTime getAccessedAt();
    String getAccessUrl();
    String getIp();
    String getOs();
}
