package com.teamlms.backend.domain.authorization.entity;

import com.teamlms.backend.domain.authorization.enums.RoleScope;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "auth_role")
public class AuthRole extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // ADMIN_SYSTEM, STUDENT_BASIC ...

    @Column(name = "description", length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_scope", nullable = false, length = 20)
    private RoleScope roleScope; // STUDENT | PROFESSOR | ADMIN

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
