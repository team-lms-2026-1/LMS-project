package com.teamlms.backend.domain.competency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.competency.entitiy.SemesterCompetencyCohortStat;

import java.util.List;
import java.util.Optional;

public interface SemesterCompetencyCohortStatRepository extends JpaRepository<SemesterCompetencyCohortStat, Long> {

    // 특정 학기, 특정 역량 통계 조회
    Optional<SemesterCompetencyCohortStat> findBySemesterSemesterIdAndCompetencyCompetencyId(
            Long semesterId,
            Long competencyId);

    List<SemesterCompetencyCohortStat> findBySemesterSemesterId(Long semesterId);

    // 특정 역량의 전체 학기 통계 조회 (트렌드 분석용)
    @Query("""
                SELECT s
                FROM SemesterCompetencyCohortStat s
                WHERE s.competency.competencyId = :competencyId
                ORDER BY s.semester.semesterId DESC
            """)
    List<SemesterCompetencyCohortStat> findByCompetencyIdOrderBySemester(
            @Param("competencyId") Long competencyId);
}
