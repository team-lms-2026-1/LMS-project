package com.teamlms.backend.domain.authorization.entity;

import com.teamlms.backend.domain.account.entity.Account;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "auth_account_role")
public class AuthAccountRole {

    @EmbeddedId
    private AuthAccountRoleId id;

    @MapsId("accountId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id")
    private Account account;

    @MapsId("roleId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id")
    private AuthRole role;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    // FK: assigned_by -> account.account_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private Account assignedBy;
}
