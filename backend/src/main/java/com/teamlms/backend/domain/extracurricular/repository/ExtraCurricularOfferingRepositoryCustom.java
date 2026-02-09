package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraOfferingApplicantBaseRow;
import com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraOfferingApplicantSessionRow;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingListItem;

public interface ExtraCurricularOfferingRepositoryCustom {

    Page<ExtraCurricularOfferingListItem> findAdminList(
        Long semesterId,
        String keyword,
        Pageable pageable
    );

    ExtraCurricularOfferingBasicDetailResponse findBasicDetailById(Long extraOfferingId);

    Page<AdminExtraOfferingApplicantBaseRow> findApplicantPage(
        Long extraOfferingId,
        String keyword,
        Pageable pageable
    );

    List<AdminExtraOfferingApplicantSessionRow> findApplicantSessionAttendance(
        Long extraOfferingId,
        List<Long> applicationIds
    );
}
