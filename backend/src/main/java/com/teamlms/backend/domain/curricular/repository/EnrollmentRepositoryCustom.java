package com.teamlms.backend.domain.curricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.curricular.api.dto.OfferingStudentListItem;

public interface EnrollmentRepositoryCustom {
    Page<OfferingStudentListItem> findStudentsByOffering(
            Long offeringId,
            String keyword,
            Pageable pageable
    );
}
