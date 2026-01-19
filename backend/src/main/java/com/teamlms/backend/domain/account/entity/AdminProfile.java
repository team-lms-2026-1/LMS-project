package com.teamlms.backend.domain.account.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "admin_profile")
public class AdminProfile {

    @Id
    @Column(name = "account_id")
    private Long accountId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "memo", length = 255)
    private String memo;

    public static AdminProfile create(Account account, String name, String email, String phone, String memo, LocalDateTime now) {
        return AdminProfile.builder()
                .account(account)
                .name(name)
                .email(email)
                .phone(phone)
                .memo(memo)
                .build();
    }

    /* =========================
       domain update methods
       ========================= */

    public void updateName(String name) {
        this.name = name;
    }

    public void updateEmail(String email) {
        this.email = email;
    }

    public void updatePhone(String phone) {
        this.phone = phone;
    }

    public void updateMemo(String memo) {
        this.memo = memo;
    }
}
