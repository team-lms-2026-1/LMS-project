package com.teamlms.backend.domain.mentoring.application;

import com.teamlms.backend.domain.mentoring.recruitment.MentoringRecruitment;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentoring_application",
       indexes = {
           @Index(name = "idx_app_recruitment_role", columnList = "recruitment_id, role"),
           @Index(name = "idx_app_status", columnList = "status")
       })
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor @Builder
public class MentoringApplication {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recruitment_id")
    private MentoringRecruitment recruitment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    // ---- account snapshot ----
    @Column(nullable = false)
    private Long accountId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 100)
    private String department;

    @Column
    private Integer grade; // 멘토는 null 가능

    // --------------------------
    @Column(nullable = false)
    private LocalDateTime appliedAt;

    @Column
    private LocalDateTime processedAt;

    @Column(length = 300)
    private String rejectReason;

    public void approve() {
        this.status = ApplicationStatus.APPROVED;
        this.processedAt = LocalDateTime.now();
        this.rejectReason = null;
    }

    public void reject(String reason) {
        this.status = ApplicationStatus.REJECTED;
        this.processedAt = LocalDateTime.now();
        this.rejectReason = reason;
    }

    public void markMatched() {
        this.status = ApplicationStatus.MATCHED;
    }
}
