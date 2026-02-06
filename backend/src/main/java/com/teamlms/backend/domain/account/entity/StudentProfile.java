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

    @Column(name = "dept_id", nullable = false)
    private Long deptId;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_status", nullable = false, length = 20)
    private AcademicStatus academicStatus; // ENROLLED | DROPPED | LEAVE | GRADUATED

    // 추가
    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    /*
     * =========================
     * domain update methods
     * =========================
     */
    // 추가
    public void updateProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updateEmail(String email) {
        this.email = email;
    }

    public void updateDeptId(Long deptId) {
        this.deptId = deptId;
    }

    public void updatePhone(String phone) {
        this.phone = phone;
    }

    public void updateGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public void updateAcademicStatus(AcademicStatus academicStatus) {
        this.academicStatus = academicStatus;
    }
}
