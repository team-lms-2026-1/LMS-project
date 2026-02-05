package com.teamlms.backend.domain.competency.entitiy;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "semester_student_competency_summary")
public class SemesterStudentCompetencySummary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "summary_id")
    private Long summaryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_account_id", nullable = false)
    private Account student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competency_id", nullable = false)
    private Competency competency;

    @Builder.Default
    @Column(name = "diagnosis_skill_score", nullable = false)
    private BigDecimal diagnosisSkillScore = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "diagnosis_aptitude_score", nullable = false)
    private BigDecimal diagnosisAptitudeScore = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "diagnosis_score", nullable = false)
    private BigDecimal diagnosisScore = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "curricular_score", nullable = false)
    private BigDecimal curricularScore = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "extra_score", nullable = false)
    private BigDecimal extraScore = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "self_extra_score", nullable = false)
    private BigDecimal selfExtraScore = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_score", nullable = false)
    private BigDecimal totalScore = BigDecimal.ZERO;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;
}
