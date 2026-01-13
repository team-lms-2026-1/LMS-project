package com.teamlms.backend.domain.account.enums;

// enum은 도메인 정책이기 때문에 entity 랑 분리
// Entity 오염 방지 / 다른 도메인에서도 재사용 가능

public enum AccountStatus {
    ACTIVE,
    INACTIVE
}
