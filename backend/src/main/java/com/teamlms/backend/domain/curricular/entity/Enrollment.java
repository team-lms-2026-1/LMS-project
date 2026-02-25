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

    // domain method
    public void confirmGrade(
            String grade,
            CompletionStatus completionStatus,
            Long actorAccountId,
            LocalDateTime confirmedAt
    ) {
        if (Boolean.TRUE.equals(this.isGradeConfirmed)) {
            throw new IllegalStateException(
                "Grade already confirmed. enrollmentId=" + this.enrollmentId
            );
        }

        this.grade = grade;
        this.completionStatus = completionStatus;
        this.isGradeConfirmed = true;
        this.gradeConfirmedBy = actorAccountId;
        this.gradeConfirmedAt = confirmedAt;
    }

    public void updateConfirmedGrade(
            String grade,
            CompletionStatus completionStatus,
            Long actorAccountId,
            LocalDateTime confirmedAt
    ) {
        this.grade = grade;
        this.completionStatus = completionStatus;
        this.isGradeConfirmed = true;
        this.gradeConfirmedBy = actorAccountId;
        this.gradeConfirmedAt = confirmedAt;
    }
    
    // 수강취소
    public void cancel() {
        if (this.enrollmentStatus != EnrollmentStatus.ENROLLED) {
            return; // 멱등
        }
        this.enrollmentStatus = EnrollmentStatus.CANCELED;
    }

    // 재신청 (CANCELED → ENROLLED)
    public void reEnroll(LocalDateTime appliedAt) {
        this.enrollmentStatus = EnrollmentStatus.ENROLLED;
        this.appliedAt = appliedAt;

        // 성적 관련 초기화 (정책적으로 안전)
        this.rawScore = null;
        this.grade = null;
        this.completionStatus = CompletionStatus.IN_PROGRESS;
        this.isGradeConfirmed = false;
        this.gradeConfirmedAt = null;
        this.gradeConfirmedBy = null;
    }

    // 점수 반영
    public void updateRawScore(Integer rawScore){
        this.rawScore = rawScore;
    }
}
