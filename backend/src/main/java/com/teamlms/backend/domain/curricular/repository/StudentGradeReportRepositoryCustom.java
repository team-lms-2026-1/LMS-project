package com.teamlms.backend.domain.curricular.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.curricular.api.dto.StudentCourseGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentGradeDetailHeaderResponse;

public interface StudentGradeReportRepositoryCustom {

    StudentGradeDetailHeaderResponse getDetailHeader(Long studentAccountId);

    Page<StudentCourseGradeListItem> listCurricular(
            Long studentAccountId,
            Long semesterId,
            Pageable pageable
    );

    Page<StudentCourseGradeListItem> listCurricularGrade(
            Long deptId,
            String keyword,
            Pageable pageable
    );
}

