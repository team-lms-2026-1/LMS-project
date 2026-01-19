package com.teamlms.backend.domain.authorization.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.authorization.entity.AuthPermission;

import java.util.List;
import java.util.Optional;

public interface AuthPermissionRepository extends JpaRepository<AuthPermission, Long> {

    Optional<AuthPermission> findByCode(String code);

    boolean existsByCode(String code);

    List<AuthPermission> findAllByIsActiveTrue();
}
