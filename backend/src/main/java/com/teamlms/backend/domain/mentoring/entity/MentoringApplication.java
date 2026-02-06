package com.teamlms.backend.domain.mentoring.entity;

import com.teamlms.backend.domain.mentoring.enums.MentoringRole;
import com.teamlms.backend.domain.mentoring.enums.MentoringApplicationStatus;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentoring_application")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class MentoringApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long applicationId;

    @Column(name = "recruitment_id", nullable = false)
    private Long recruitmentId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private MentoringRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private MentoringApplicationStatus status;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by")
    private Long processedBy;

    @Column(name = "reject_reason")
    private String rejectReason;

    @Column(name = "apply_reason", columnDefinition = "TEXT")
    private String applyReason;

    public void updateStatus(MentoringApplicationStatus status, String rejectReason, Long processedBy) {
        this.status = status;
        this.rejectReason = rejectReason;
        this.processedBy = processedBy;
        this.processedAt = LocalDateTime.now();
    }
}
