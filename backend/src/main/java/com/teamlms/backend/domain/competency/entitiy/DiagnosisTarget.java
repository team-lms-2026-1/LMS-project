package com.teamlms.backend.domain.competency.entitiy;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.competency.enums.DiagnosisTargetStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "diagnosis_target")
public class DiagnosisTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "target_id")
    private Long targetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", nullable = false)
    private DiagnosisRun run;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_account_id", nullable = false)
    private Account student;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DiagnosisTargetStatus status;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;
}
