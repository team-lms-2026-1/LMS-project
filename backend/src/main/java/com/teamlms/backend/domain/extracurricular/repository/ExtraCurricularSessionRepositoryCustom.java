package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionListItem;

public interface ExtraCurricularSessionRepositoryCustom {
    
    Page<ExtraCurricularSessionListItem> findAdminSessionList(
        Long extraOfferingId,
        String keyword,
        Pageable pageable
    );

    ExtraCurricularSessionDetailResponse findAdminSessionDetail(
        Long extraOfferingId,
        Long sessionId
    );
}
