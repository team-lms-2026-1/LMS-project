package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularGradeListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCompletionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraGradeDetailHeaderResponse;

public interface StudentExtraGradeReportRepositoryCustom {

    StudentExtraGradeDetailHeaderResponse getDetailHeader(Long studentAccountId);

    Page<ExtraCurricularGradeListItem> listStudentGradeSummary(
        Long deptId,
        String keyword,
        Pageable pageable
    );

    Page<StudentExtraCompletionListItem> listCompletions(
        Long studentAccountId,
        Long semesterId,
        Pageable pageable,
        String keyword
    );
}
