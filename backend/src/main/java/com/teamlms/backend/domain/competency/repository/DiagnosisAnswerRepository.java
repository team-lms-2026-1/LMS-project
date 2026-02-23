package com.teamlms.backend.domain.competency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.competency.entitiy.DiagnosisAnswer;

import java.util.List;
import java.util.Optional;

public interface DiagnosisAnswerRepository extends JpaRepository<DiagnosisAnswer, Long> {

    // 특정 제출의 답변 목록 조회
    List<DiagnosisAnswer> findBySubmissionSubmissionId(Long submissionId);

    // 특정 제출의 특정 문항 답변 조회
    Optional<DiagnosisAnswer> findBySubmissionSubmissionIdAndQuestionQuestionId(
            Long submissionId,
            Long questionId);

    // 특정 문항의 모든 답변 조회
    @Query("""
                SELECT da
                FROM DiagnosisAnswer da
                WHERE da.question.questionId = :questionId
            """)
    List<DiagnosisAnswer> findByQuestionId(@Param("questionId") Long questionId);

    // 특정 제출의 답변 수 조회
    long countBySubmissionSubmissionId(Long submissionId);
    @Query("""
                SELECT da
                FROM DiagnosisAnswer da
                JOIN FETCH da.question q
                JOIN FETCH da.submission s
                WHERE s.run.runId = :runId
            """)
    List<DiagnosisAnswer> findByRunRunId(@Param("runId") Long runId);


}
