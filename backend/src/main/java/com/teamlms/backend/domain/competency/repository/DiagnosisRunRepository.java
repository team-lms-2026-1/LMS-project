package com.teamlms.backend.domain.competency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.competency.entitiy.DiagnosisRun;

import java.util.List;
import java.util.Optional;

import com.teamlms.backend.domain.competency.enums.DiagnosisRunStatus;

public interface DiagnosisRunRepository extends JpaRepository<DiagnosisRun, Long> {

    // 학기별 진단 실행 조회
    Optional<DiagnosisRun> findBySemesterSemesterId(Long semesterId);

    // 특정 상태의 진단 실행 조회
    @Query("""
                SELECT dr
                FROM DiagnosisRun dr
                WHERE dr.status = :status
                ORDER BY dr.createdAt DESC
            """)
    List<DiagnosisRun> findByStatus(
            @Param("status") DiagnosisRunStatus status);
}
