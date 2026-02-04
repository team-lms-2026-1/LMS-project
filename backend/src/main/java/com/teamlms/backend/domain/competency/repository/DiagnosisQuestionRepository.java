package com.teamlms.backend.domain.competency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.competency.entitiy.DiagnosisQuestion;

import java.util.List;

public interface DiagnosisQuestionRepository extends JpaRepository<DiagnosisQuestion, Long> {

        // 특정 진단의 문항 목록 조회 (정렬 순서대로)
        List<DiagnosisQuestion> findByRunRunIdOrderBySortOrderAsc(Long runId);

        // 특정 진단의 문항 삭제
        @org.springframework.data.jpa.repository.Modifying
        @org.springframework.transaction.annotation.Transactional
        @Query("DELETE FROM DiagnosisQuestion dq WHERE dq.run.runId = :runId")
        void deleteByRunRunId(@Param("runId") Long runId);

        // 특정 진단의 문항 수 조회
        long countByRunRunId(Long runId);

        // 특정 진단의 특정 순서 문항 조회
        @Query("""
                            SELECT dq
                            FROM DiagnosisQuestion dq
                            WHERE dq.run.runId = :runId
                              AND dq.sortOrder = :sortOrder
                        """)
        java.util.Optional<DiagnosisQuestion> findByRunIdAndSortOrder(
                        @Param("runId") Long runId,
                        @Param("sortOrder") Integer sortOrder);
}
