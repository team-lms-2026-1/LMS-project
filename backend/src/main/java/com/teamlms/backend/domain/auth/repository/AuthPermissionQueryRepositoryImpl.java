package com.teamlms.backend.domain.auth.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class AuthPermissionQueryRepositoryImpl implements AuthPermissionQueryRepository {

    private final EntityManager em;

    @Override
    public List<String> findPermissionCodesByAccountId(Long accountId) {

        @SuppressWarnings("unchecked")
        List<String> codes = em.createNativeQuery("""
            select distinct p.code
            from auth_account_role ar
            join auth_role r on r.role_id = ar.role_id
            join auth_role_permission rp on rp.role_id = r.role_id
            join auth_permission p on p.permission_id = rp.permission_id
            where ar.account_id = :accountId
              and r.is_active = true
              and p.is_active = true
            order by p.code
        """)
        .setParameter("accountId", accountId)
        .getResultList();

        return codes;
    }
}
