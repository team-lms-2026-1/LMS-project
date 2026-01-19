package com.teamlms.backend.domain.authorization.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.authorization.entity.AuthRolePermission;
import com.teamlms.backend.domain.authorization.entity.AuthRolePermissionId;

import java.util.List;

public interface AuthRolePermissionRepository extends JpaRepository<AuthRolePermission, AuthRolePermissionId> {

    // role에 포함된 permission들
    List<AuthRolePermission> findAllByIdRoleId(Long roleId);

    // 특정 permission이 어느 role들에 들어가 있는지
    List<AuthRolePermission> findAllByIdPermissionId(Long permissionId);

    boolean existsByIdRoleIdAndIdPermissionId(Long roleId, Long permissionId);

    void deleteAllByIdRoleId(Long roleId);
}
