package com.teamlms.backend.domain.auth.repository;

import java.util.List;

public interface AuthPermissionQueryRepository {
    List<String> findPermissionCodesByAccountId(Long accountId);
}
