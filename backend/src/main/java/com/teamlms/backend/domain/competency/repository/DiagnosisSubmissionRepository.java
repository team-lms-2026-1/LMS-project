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
    List<DiagnosisSubmission> findByRunRunIdIn(List<Long> runIds);

    // 특정 진단의 특정 학생 제출 조회
    Optional<DiagnosisSubmission> findByRunRunIdAndStudentAccountId(Long runId, Long studentAccountId);

    // 특정 진단의 제출 수 조회
    long countByRunRunId(Long runId);

    // All-semester response count by academic status
    @Query("""
                SELECT COUNT(ds.submissionId)
                FROM DiagnosisSubmission ds
                JOIN StudentProfile p ON ds.student.accountId = p.accountId
                WHERE p.academicStatus = :status
            """)
    long countByAcademicStatus(
            @Param("status") com.teamlms.backend.domain.account.enums.AcademicStatus status);

    // All-semester response count by academic status and dept
    @Query("""
                SELECT COUNT(ds.submissionId)
                FROM DiagnosisSubmission ds
                JOIN StudentProfile p ON ds.student.accountId = p.accountId
                WHERE p.academicStatus = :status
                  AND p.deptId = :deptId
            """)
    long countByAcademicStatusAndDeptId(
            @Param("status") com.teamlms.backend.domain.account.enums.AcademicStatus status,
            @Param("deptId") Long deptId);

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
