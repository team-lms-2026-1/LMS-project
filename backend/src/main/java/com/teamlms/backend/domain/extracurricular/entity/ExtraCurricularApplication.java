package com.teamlms.backend.domain.extracurricular.entity;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.extracurricular.enums.CompletionStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "extra_curricular_application",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_extra_application_offering_student",
            columnNames = { "extra_offering_id", "student_account_id" }
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExtraCurricularApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long applicationId;

    @Column(name = "extra_offering_id", nullable = false)
    private Long extraOfferingId;

    @Column(name = "student_account_id", nullable = false)
    private Long studentAccountId;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "apply_status", nullable = false)
    private ExtraApplicationApplyStatus applyStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status", nullable = false)
    private CompletionStatus completionStatus;

    @Column(name = "passed_at")
    private LocalDateTime passedAt;

    // ---------------------------
    // A안: 정적 팩토리 (생성)
    // ---------------------------
    public static ExtraCurricularApplication createApplied(
        Long extraOfferingId,
        Long studentAccountId,
        LocalDateTime now
    ) {
        ExtraCurricularApplication e = new ExtraCurricularApplication();
        e.extraOfferingId = extraOfferingId;
        e.studentAccountId = studentAccountId;
        e.appliedAt = now;
        e.applyStatus = ExtraApplicationApplyStatus.APPLIED;
        e.completionStatus = CompletionStatus.IN_PROGRESS;
        e.passedAt = null;
        return e;
    }

    // ---------------------------
    // A안: 최소 변경 메서드 (재신청)
    // - 취소 -> 신청으로 되돌릴 때 사용
    // ---------------------------
    public void reApply(LocalDateTime now) {
        this.appliedAt = now;
        this.applyStatus = ExtraApplicationApplyStatus.APPLIED;
        this.completionStatus = CompletionStatus.IN_PROGRESS;
        this.passedAt = null;
    }

    // ---------------------------
    // (옵션) 최소 변경 메서드 (취소)
    // ---------------------------
    public void cancel(LocalDateTime now) {
        this.applyStatus = ExtraApplicationApplyStatus.CANCELED;
        // 취소 시각 컬럼이 필요하면 canceledAt 추가하는 게 더 깔끔함(지금 엔티티엔 없음)
        // this.canceledAt = now;
    }
}
