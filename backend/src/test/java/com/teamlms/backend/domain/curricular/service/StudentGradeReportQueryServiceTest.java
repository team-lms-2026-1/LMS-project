package com.teamlms.backend.domain.curricular.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.curricular.api.dto.CurricularGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentCourseGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentGradeDetailHeaderResponse;
import com.teamlms.backend.domain.curricular.repository.StudentGradeReportRepositoryCustom;

@ExtendWith(MockitoExtension.class)
class StudentGradeReportQueryServiceTest {

    @InjectMocks
    private StudentGradeReportQueryService gradeReportQueryService;

    @Mock
    private StudentGradeReportRepositoryCustom repo;

    @Test
    @DisplayName("학과별/키워드별 전체 성적 목록 페이징 조회 성공")
    void curricularGradeList_Success() {
        // given
        Long deptId = 1L;
        String keyword = "test";
        Pageable pageable = PageRequest.of(0, 10);

        CurricularGradeListItem item = mock(CurricularGradeListItem.class);
        Page<CurricularGradeListItem> mockPage = new PageImpl<>(List.of(item), pageable, 1);

        when(repo.listCurricularGrade(eq(deptId), eq(keyword), eq(pageable))).thenReturn(mockPage);

        // when
        Page<CurricularGradeListItem> result = gradeReportQueryService.curricularGradeList(deptId, keyword, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        verify(repo).listCurricularGrade(eq(deptId), eq(keyword), eq(pageable));
    }

    @Test
    @DisplayName("특정 학생의 전체 학점 및 평점(GPA) 요약 정보 조회 성공")
    void getDetailHeader_Success() {
        // given
        Long studentAccountId = 1L;
        StudentGradeDetailHeaderResponse header = mock(StudentGradeDetailHeaderResponse.class);

        when(repo.getDetailHeader(studentAccountId)).thenReturn(header);

        // when
        StudentGradeDetailHeaderResponse result = gradeReportQueryService.getDetailHeader(studentAccountId);

        // then
        assertNotNull(result);
        verify(repo).getDetailHeader(studentAccountId);
    }

    @Test
    @DisplayName("특정 학생의 특정 학기 수강 성적 목록 페이징 조회 성공")
    void listCurricular_Success() {
        // given
        Long studentAccountId = 1L;
        Long semesterId = 2L;
        String keyword = "math";
        Pageable pageable = PageRequest.of(0, 10);

        StudentCourseGradeListItem item = mock(StudentCourseGradeListItem.class);
        Page<StudentCourseGradeListItem> mockPage = new PageImpl<>(List.of(item), pageable, 1);

        when(repo.listCurricular(eq(studentAccountId), eq(semesterId), eq(pageable), eq(keyword))).thenReturn(mockPage);

        // when
        Page<StudentCourseGradeListItem> result = gradeReportQueryService.listCurricular(studentAccountId, semesterId,
                pageable, keyword);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(repo).listCurricular(eq(studentAccountId), eq(semesterId), eq(pageable), eq(keyword));
    }
}
