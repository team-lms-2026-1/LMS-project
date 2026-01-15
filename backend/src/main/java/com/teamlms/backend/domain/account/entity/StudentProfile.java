package com.teamlms.backend.domain.account.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.account.enums.AcademicStatus;
import com.teamlms.backend.global.audit.BaseEntity;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "student_profile")
public class StudentProfile extends BaseEntity {

    @Id
    @Column(name = "account_id")
    private Long accountId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "student_no", nullable = false, unique = true, length = 30)
    private String studentNo;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_status", nullable = false, length = 20)
    private AcademicStatus academicStatus; // ENROLLED | DROPPED | LEAVE | GRADUATED

    public static StudentProfile create(Account account, String studentNo, String name, String email, String phone,
                                        Integer gradeLevel, AcademicStatus academicStatus, LocalDateTime now) {
        return StudentProfile.builder()
                .account(account)
                .studentNo(studentNo)
                .name(name)
                .email(email)
                .phone(phone)
                .gradeLevel(gradeLevel)
                .academicStatus(academicStatus)
                .build();
    }
}
