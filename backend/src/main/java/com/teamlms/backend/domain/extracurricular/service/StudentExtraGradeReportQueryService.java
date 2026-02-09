package com.teamlms.backend.domain.extracurricular.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularGradeListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCompletionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraGradeDetailHeaderResponse;
import com.teamlms.backend.domain.extracurricular.repository.StudentExtraGradeReportRepositoryCustom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentExtraGradeReportQueryService {

    private final StudentExtraGradeReportRepositoryCustom repo;

    public StudentExtraGradeDetailHeaderResponse getDetailHeader(Long studentAccountId) {
        return repo.getDetailHeader(studentAccountId);
    }

    public Page<ExtraCurricularGradeListItem> listStudentGradeSummary(
        Long deptId,
        String keyword,
        Pageable pageable
    ) {
        return repo.listStudentGradeSummary(deptId, keyword, pageable);
    }

    public Page<StudentExtraCompletionListItem> listCompletions(
        Long studentAccountId,
        Long semesterId,
        Pageable pageable,
        String keyword
    ) {
        return repo.listCompletions(studentAccountId, semesterId, pageable, keyword);
    }
}
