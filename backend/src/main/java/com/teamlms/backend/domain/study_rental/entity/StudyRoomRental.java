package com.teamlms.backend.domain.study_rental.entity;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "study_room_rental", indexes = {
        @Index(name = "idx_rental_room_start", columnList = "room_id, start_at"),
        @Index(name = "idx_rental_applicant_applied", columnList = "applicant_account_id, applied_at"),
        @Index(name = "idx_rental_status_applied", columnList = "status, applied_at")
})
public class StudyRoomRental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rental_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private StudyRoom studyRoom;

    // 신청자 (Account Entity 연결)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_account_id", nullable = false)
    private Account applicant;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private RentalStatus status;

    @CreatedDate
    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    // 처리자 (Account Entity 연결)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private Account processor;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    public void process(RentalStatus newStatus, Account processor, String rejectionReason) {
        this.status = newStatus;
        this.processor = processor; // 처리자(관리자) 기록
        this.processedAt = LocalDateTime.now(); // 처리 시간 기록
        this.rejectionReason = rejectionReason; // 반려 사유 기록 (승인 시 null)
    }

    public void cancel() {
        this.status = RentalStatus.CANCELED;
    }
}