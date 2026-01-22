package com.teamlms.backend.domain.curricular.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CurricularOfferingQueryService {

    private final CurricularOfferingRepository curricularOfferingRepository;

    public Page<CurricularOfferingListItem> list(
            Long semesterId,
            String keyword,
            Pageable pageable
    ) {
        return curricularOfferingRepository.findOfferingList(semesterId, keyword, pageable);
    }
}
