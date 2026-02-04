package com.teamlms.backend.domain.curricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUserListItem;
import com.teamlms.backend.domain.curricular.api.dto.EnrollListItem;

public interface CurricularOfferingRepositoryCustom {

    Page<CurricularOfferingListItem> findOfferingAdminList(
            Long semesterId,
            String keyword,
            Pageable pageable
    );

    Page<CurricularOfferingUserListItem> findOfferingUserList(
            String keyword,
            Pageable pageable
    );

    CurricularOfferingDetailResponse findOfferingDetail(Long offeringId);

    Page<EnrollListItem> findOfferingEnrollList(Long accountId, Pageable pageable);
    Page<EnrollListItem> findOfferingCurrentEnrollments(Long accountId, Pageable pageable);


}
