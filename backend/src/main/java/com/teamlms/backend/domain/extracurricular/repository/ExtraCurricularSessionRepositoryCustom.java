package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraCurricularSessionDetailRow;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCurricularSessionDetailRow;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCurricularSessionListItem;

public interface ExtraCurricularSessionRepositoryCustom {
    
    Page<ExtraCurricularSessionListItem> findAdminSessionList(
        Long extraOfferingId,
        String keyword,
        Pageable pageable
    );

    Page<StudentExtraCurricularSessionListItem> findStudentSessionList(
        Long extraOfferingId,
        Long applicationId,
        String keyword,
        Pageable pageable
    );

    AdminExtraCurricularSessionDetailRow findAdminSessionDetail(
        Long extraOfferingId,
        Long sessionId
    );

    StudentExtraCurricularSessionDetailRow findStudentSessionDetail(
        Long extraOfferingId,
        Long sessionId
    );
}
