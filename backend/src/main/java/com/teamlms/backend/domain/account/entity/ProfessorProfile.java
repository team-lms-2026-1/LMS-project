package com.teamlms.backend.domain.account.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.teamlms.backend.global.audit.BaseEntity;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "professor_profile")
public class ProfessorProfile extends BaseEntity {

    @Id
    @Column(name = "account_id")
    private Long accountId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "professor_no", nullable = false, unique = true, length = 30)
    private String professorNo;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "dept_id", nullable = false)
    private Long deptId;


    public static ProfessorProfile create(Account account, String professorNo, String name, String email, String phone,
                                          Long deptId, LocalDateTime now) {
        return ProfessorProfile.builder()
                .account(account)
                .professorNo(professorNo)
                .name(name)
                .email(email)
                .phone(phone)
                .deptId(deptId)
                .build();
    }
}
