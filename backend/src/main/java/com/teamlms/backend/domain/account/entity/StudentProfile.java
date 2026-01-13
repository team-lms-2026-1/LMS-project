package com.teamlms.backend.domain.account.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import java.time.LocalDateTime;

import com.teamlms.backend.domain.account.enums.AcademicStatus;

@Entity
@Table(name = "student_profile")
public class StudentProfile {

    @Id
    @Column(name = "account_id")
    private Long accountId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "student_no", nullable = false, unique = true)
    private String studentNo;

    @Column(name = "name", nullable = false)
    private String name;

    private String email;
    private String phone;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_status", nullable = false)
    private AcademicStatus academicStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
