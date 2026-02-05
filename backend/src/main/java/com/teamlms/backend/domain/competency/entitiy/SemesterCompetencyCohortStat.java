package com.teamlms.backend.domain.competency.entitiy;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
@Table(name = "semester_competency_cohort_stat")
public class SemesterCompetencyCohortStat extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Long statId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competency_id", nullable = false)
    private Competency competency;

    @Column(name = "target_count", nullable = false)
    private Integer targetCount;

    @Column(name = "calculated_count", nullable = false)
    private Integer calculatedCount;

    @Column(name = "mean", nullable = false)
    private BigDecimal mean;

    @Column(name = "max_score", nullable = false)
    private BigDecimal maxScore;

    @Column(name = "median")
    private BigDecimal median;

    @Column(name = "stddev")
    private BigDecimal stddev;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;
}
