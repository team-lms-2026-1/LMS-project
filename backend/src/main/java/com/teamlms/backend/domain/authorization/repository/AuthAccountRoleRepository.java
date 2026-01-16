package com.teamlms.backend.domain.authorization.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.authorization.entity.AuthAccountRole;
import com.teamlms.backend.domain.authorization.entity.AuthAccountRoleId;

import java.util.List;

public interface AuthAccountRoleRepository extends JpaRepository<AuthAccountRole, AuthAccountRoleId> {

    // 계정이 가진 role들
    List<AuthAccountRole> findAllByIdAccountId(Long accountId);

    // role을 가진 계정들
    List<AuthAccountRole> findAllByIdRoleId(Long roleId);

    boolean existsByIdAccountIdAndIdRoleId(Long accountId, Long roleId);

    void deleteAllByIdAccountId(Long accountId);
}
