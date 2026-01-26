package com.teamlms.backend.domain.curricular.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.curricular.api.dto.StudentCourseGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentGradeDetailHeaderResponse;
import com.teamlms.backend.domain.curricular.repository.StudentGradeReportRepositoryCustom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentGradeReportQueryService {

    private final StudentGradeReportRepositoryCustom repo;

    public StudentGradeDetailHeaderResponse getDetailHeader(Long studentAccountId) {
        return repo.getDetailHeader(studentAccountId);
    }

    public Page<StudentCourseGradeListItem> listCurricular(Long studentAccountId, Long semesterId, Pageable pageable) {
        return repo.listCurricular(studentAccountId, semesterId, pageable);
    }
}
