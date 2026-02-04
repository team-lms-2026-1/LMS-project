package com.teamlms.backend.domain.curricular.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.teamlms.backend.domain.curricular.api.dto.EnrollListItem;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentQueryService {

    private final CurricularOfferingRepository curricularOfferingRepository;

    // 신청목록 (Student)
    public Page<EnrollListItem> listEnrollments(
            Long accountId,
            Pageable pageable
    ) {
        return curricularOfferingRepository.findOfferingEnrollList(accountId, pageable);
    }

    // 수강목록 (Student)
    public Page<EnrollListItem> listCurrentEnrollments(
            Long accountId,
            Pageable pageable
    ) {
        return curricularOfferingRepository.findOfferingCurrentEnrollments(accountId, pageable);
    }
}
