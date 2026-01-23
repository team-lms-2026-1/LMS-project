package com.teamlms.backend.domain.curricular.entity;

import com.teamlms.backend.domain.curricular.enums.CompletionStatus;
import com.teamlms.backend.domain.curricular.enums.EnrollmentStatus;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(
    name = "enrollment",
    indexes = {
        @Index(name = "idx_enrollment_offering_id", columnList = "offering_id"),
        @Index(name = "idx_enrollment_student_account_id", columnList = "student_account_id")
    }
)
public class Enrollment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    private Long enrollmentId;

    @Column(name = "offering_id", nullable = false)
    private Long offeringId;

    @Column(name = "student_account_id", nullable = false)
    private Long studentAccountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_status", length = 20, nullable = false)
    private EnrollmentStatus enrollmentStatus; // ENROLLED, DROPPED, COMPLETED

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status", length = 20, nullable = false)
    private CompletionStatus completionStatus; // IN_PROGRESS, PASSED, FAILED

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "raw_score")
    private Integer rawScore; // 0 ~ 100 점수

    @Column(name = "grade", length = 10)
    private String grade;  // A, B, C, D, F 등

    @Column(name = "is_grade_confirmed", nullable = false)
    private Boolean isGradeConfirmed; // 성적 확정 여부

    @Column(name = "grade_confirmed_at")
    private LocalDateTime gradeConfirmedAt;

    @Column(name = "grade_confirmed_by")
    private Long gradeConfirmedBy;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;
}
