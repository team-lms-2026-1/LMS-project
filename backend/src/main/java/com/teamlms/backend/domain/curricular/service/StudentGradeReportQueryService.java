package com.teamlms.backend.domain.curricular.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.curricular.api.dto.CurricularGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentCourseGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentGradeDetailHeaderResponse;
import com.teamlms.backend.domain.curricular.repository.StudentGradeReportRepositoryCustom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentGradeReportQueryService {

    private final StudentGradeReportRepositoryCustom repo;

    public Page<CurricularGradeListItem>  curricularGradeList(Long deptId, String keyword, Pageable pageable){
        return repo.listCurricularGrade(deptId, keyword, pageable);
    }

    public StudentGradeDetailHeaderResponse getDetailHeader(Long studentAccountId) {
        return repo.getDetailHeader(studentAccountId);
    }

    public Page<StudentCourseGradeListItem> listCurricular(Long studentAccountId, Long semesterId, Pageable pageable, String keyword) {
        return repo.listCurricular(studentAccountId, semesterId, pageable, keyword);
    }
}
