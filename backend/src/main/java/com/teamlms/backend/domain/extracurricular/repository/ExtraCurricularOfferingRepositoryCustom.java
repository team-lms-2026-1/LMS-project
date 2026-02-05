package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingListItem;

public interface ExtraCurricularOfferingRepositoryCustom {

    // 목록
    Page<ExtraCurricularOfferingListItem> findAdminList(
        Long semesterId,
        String keyword,
        Pageable pageable
    );

    // 상세 기본
    ExtraCurricularOfferingBasicDetailResponse findBasicDetailById(Long extraOfferingId);

}
