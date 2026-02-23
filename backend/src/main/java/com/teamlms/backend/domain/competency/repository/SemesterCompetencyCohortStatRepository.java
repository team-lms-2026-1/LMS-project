package com.teamlms.backend.domain.competency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.competency.entitiy.SemesterCompetencyCohortStat;

import java.util.List;
import java.util.Optional;

public interface SemesterCompetencyCohortStatRepository extends JpaRepository<SemesterCompetencyCohortStat, Long> {

    boolean existsBySemesterSemesterId(Long semesterId);

    Optional<SemesterCompetencyCohortStat> findBySemesterSemesterIdAndCompetencyCompetencyId(
            Long semesterId,
            Long competencyId);

    List<SemesterCompetencyCohortStat> findBySemesterSemesterId(Long semesterId);

    @Query("""
                SELECT s
                FROM SemesterCompetencyCohortStat s
                WHERE s.competency.competencyId = :competencyId
                ORDER BY s.semester.semesterId DESC
            """)
    List<SemesterCompetencyCohortStat> findByCompetencyIdOrderBySemester(
            @Param("competencyId") Long competencyId);
}