package com.teamlms.backend.domain.account.entity;

import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "account")
public class Account extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 20)
    private AccountType accountType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AccountStatus status;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    // (선택) 생성 팩토리로 필수값 통일
    public static Account create(String loginId, String passwordHash, AccountType type, AccountStatus status,
                                 Long actorAccountId, LocalDateTime now) {
        return Account.builder()
                .loginId(loginId)
                .passwordHash(passwordHash)
                .accountType(type)
                .status(status)
                .build();
    }

    public void changeStatus(AccountStatus newStatus, Long actorAccountId, LocalDateTime now) {
        this.status = newStatus;
    }

    public void updateLastLoginAt(LocalDateTime at) {
        this.lastLoginAt = at;
    }
}
