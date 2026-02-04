package com.teamlms.backend.domain.log.repository.projection;

/** 계정 헤더용 Projection (Repository 전용) */
public interface UserHeaderRow {
    Long getAccountId();

    String getLoginId();

    String getAccountType();

    String getName();
}
