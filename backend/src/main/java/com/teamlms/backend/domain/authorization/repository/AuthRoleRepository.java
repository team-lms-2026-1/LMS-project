package com.teamlms.backend.domain.authorization.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.authorization.entity.AuthRole;
import com.teamlms.backend.domain.authorization.enums.RoleScope;

import java.util.List;
import java.util.Optional;

public interface AuthRoleRepository extends JpaRepository<AuthRole, Long> {

    Optional<AuthRole> findByCode(String code);

    boolean existsByCode(String code);

    List<AuthRole> findAllByRoleScope(RoleScope roleScope);

    List<AuthRole> findAllByIsActiveTrue();
}
