package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionCompletion;

// 출석 집계 + 무효화(delete) 담당
public interface ExtraCurricularSessionCompletionRepository
        extends JpaRepository<ExtraCurricularSessionCompletion, Long> {

    List<ExtraCurricularSessionCompletion> findByApplicationId(Long applicationId);
    
    /**
     * 신청자별 출석 완료 세션 수
     */
    @Query("""
        select count(c)
        from ExtraCurricularSessionCompletion c
        where c.applicationId = :applicationId
          and c.sessionId in :sessionIds
          and c.isAttended = true
    """)
    long countAttendedByApplicationIdAndSessionIds(
            @Param("applicationId") Long applicationId,
            @Param("sessionIds") List<Long> sessionIds
    );

    Optional<ExtraCurricularSessionCompletion> findBySessionIdAndApplicationId(Long sessionId, Long applicationId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("delete from ExtraCurricularSessionCompletion c where c.sessionId = :sessionId")
        int deleteAllBySessionId(@Param("sessionId") Long sessionId);
}
