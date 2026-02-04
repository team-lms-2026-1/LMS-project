package com.teamlms.backend.domain.competency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.competency.entitiy.DiagnosisSubmission;

import java.util.List;
import java.util.Optional;

public interface DiagnosisSubmissionRepository extends JpaRepository<DiagnosisSubmission, Long> {

    // 특정 진단의 제출 목록 조회
    List<DiagnosisSubmission> findByRunRunId(Long runId);

    // 특정 진단의 특정 학생 제출 조회
    Optional<DiagnosisSubmission> findByRunRunIdAndStudentAccountId(Long runId, Long studentAccountId);

    // 특정 진단의 제출 수 조회
    long countByRunRunId(Long runId);

    // 특정 학생의 제출 이력 조회
    @Query("""
                SELECT ds
                FROM DiagnosisSubmission ds
                WHERE ds.student.accountId = :studentAccountId
                ORDER BY ds.submittedAt DESC
            """)
    List<DiagnosisSubmission> findByStudentAccountIdOrderBySubmittedAtDesc(
            @Param("studentAccountId") Long studentAccountId);
}
