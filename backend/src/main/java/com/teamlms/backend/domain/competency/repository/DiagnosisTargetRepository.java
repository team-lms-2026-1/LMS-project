package com.teamlms.backend.domain.competency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.competency.entitiy.DiagnosisTarget;
import com.teamlms.backend.domain.competency.enums.DiagnosisTargetStatus;

import java.util.List;
import java.util.Optional;

public interface DiagnosisTargetRepository extends JpaRepository<DiagnosisTarget, Long> {

  // 특정 진단의 대상자 목록 조회
  List<DiagnosisTarget> findByRunRunId(Long runId);

  // 특정 진단의 총 대상자 수 조회
  long countByRunRunId(Long runId);

  // 특정 진단의 특정 학생 대상자 조회
  Optional<DiagnosisTarget> findByRunRunIdAndStudentAccountId(Long runId, Long studentAccountId);

  // 특정 학생의 모든 진단 대상 내역 조회
  List<DiagnosisTarget> findByStudentAccountId(Long accountId);

  // 특정 진단의 상태별 대상자 수 조회
  long countByRunRunIdAndStatus(Long runId, DiagnosisTargetStatus status);

  // 미실시 학생 목록 조회
  @Query("""
          SELECT dt
          FROM DiagnosisTarget dt
          WHERE dt.run.runId = :runId
            AND dt.status = 'PENDING'
          ORDER BY dt.student.accountId
      """)
  List<DiagnosisTarget> findPendingTargetsByRunId(@Param("runId") Long runId);
}
