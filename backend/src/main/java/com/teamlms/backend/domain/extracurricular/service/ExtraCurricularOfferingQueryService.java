package com.teamlms.backend.domain.extracurricular.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUserListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingUserListItem;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ExtraCurricularOfferingQueryService {

    private final ExtraCurricularOfferingRepository offeringRepository;

    // 목록
    public Page<ExtraCurricularOfferingListItem> list(
        Long semesterId,
        String keyword,
        Pageable pageable
    ) {
        return offeringRepository.findAdminList(semesterId, keyword, pageable);
    }

    //목록 ( User )
    public Page<ExtraCurricularOfferingUserListItem> listForUser(
            String keyword,
            Pageable pageable
    ) {
        return offeringRepository.findOfferingUserList(keyword, pageable);
    }

    // 상세 기본
    public ExtraCurricularOfferingBasicDetailResponse getBasicDetail(Long extraOfferingId) {

        ExtraCurricularOfferingBasicDetailResponse dto =
            offeringRepository.findBasicDetailById(extraOfferingId);

        if (dto == null) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND);
        }

        return dto;
    }
}