package com.teamlms.backend.domain.authorization.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.teamlms.backend.domain.authorization.entity.AuthAccountRole;
import com.teamlms.backend.domain.authorization.entity.AuthAccountRoleId;

import java.util.Set;

public interface AuthorizationQueryRepository extends JpaRepository<AuthAccountRole, AuthAccountRoleId> {

    // Authorization 붙일 때 거의 무조건 필요한 로그인시 권한코드 한방에 뽑기 queryrepo
    @Query("""
        select distinct p.code
        from AuthAccountRole ar
        join ar.role r
        join AuthRolePermission rp on rp.role = r
        join rp.permission p
        where ar.account.accountId = :accountId
          and r.isActive = true
          and p.isActive = true
    """)
    Set<String> findActivePermissionCodes(Long accountId);

    @Query("""
        select distinct r.code
        from AuthAccountRole ar
        join ar.role r
        where ar.account.accountId = :accountId
          and r.isActive = true
    """)
    Set<String> findActiveRoleCodes(Long accountId);
}
