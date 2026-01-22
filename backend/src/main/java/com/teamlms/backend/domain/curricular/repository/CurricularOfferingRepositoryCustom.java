package com.teamlms.backend.domain.curricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;

public interface CurricularOfferingRepositoryCustom {

    Page<CurricularOfferingListItem> findOfferingList(
            Long semesterId,
            String keyword,
            Pageable pageable
    );
}
