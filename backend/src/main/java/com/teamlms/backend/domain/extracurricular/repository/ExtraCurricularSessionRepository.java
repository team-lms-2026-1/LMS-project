package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionListItem;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSession;

public interface ExtraCurricularSessionRepository extends JpaRepository<ExtraCurricularSession, Long>, ExtraCurricularSessionAggregateRepository, ExtraCurricularSessionRepositoryCustom {

    boolean existsByExtraOfferingIdAndSessionName(Long extraOfferingId, String sessionName);

    Page<ExtraCurricularSessionListItem> findAdminSessionList(
        Long extraOfferingId,
        String keyword,
        Pageable pageable
    );

    ExtraCurricularSessionDetailResponse findAdminSessionDetail(
        Long extraOfferingId,
        Long sessionId
    );
    
    /**
     * 비교과 운영 내 유효한 세션 목록 (CANCELED 제외)
     */
    @Query("""
        select s.sessionId
        from ExtraCurricularSession s
        where s.extraOfferingId = :extraOfferingId
          and s.status <> 'CANCELED'
    """)
    List<Long> findValidSessionIds(@Param("extraOfferingId") Long extraOfferingId);
}
