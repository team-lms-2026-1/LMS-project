package com.teamlms.backend.domain.competency.service;

import com.teamlms.backend.domain.competency.api.dto.*;
import com.teamlms.backend.domain.competency.entitiy.*;
import com.teamlms.backend.domain.competency.enums.DiagnosisRunStatus;
import com.teamlms.backend.domain.competency.repository.*;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiagnosisQueryServiceTest {

    @InjectMocks
    private DiagnosisQueryService diagnosisQueryService;

    @Mock
    private DiagnosisRunRepository diagnosisRunRepository;
    @Mock
    private DiagnosisQuestionRepository diagnosisQuestionRepository;
    @Mock
    private DiagnosisTargetRepository diagnosisTargetRepository;
    @Mock
    private DiagnosisSubmissionRepository diagnosisSubmissionRepository;
    @Mock
    private DiagnosisAnswerRepository diagnosisAnswerRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private DeptRepository deptRepository;
    @Mock
    private SemesterCompetencyCohortStatRepository statRepository;
    @Mock
    private SemesterStudentCompetencySummaryRepository summaryRepository;
    @Mock
    private CompetencyRepository competencyRepository;

    @Test
    @DisplayName("진단지 목록 조회 성공")
    void listDiagnoses_Success() {
        // given
        PageRequest pageable = PageRequest.of(0, 10);
        Semester semester = Semester.builder().build();
        ReflectionTestUtils.setField(semester, "displayName", "2024-1");

        DiagnosisRun run = DiagnosisRun.builder()
                .runId(1L)
                .title("진단지")
                .semester(semester)
                .status(DiagnosisRunStatus.OPEN)
                .build();

        when(diagnosisRunRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(run)));
        when(deptRepository.findAllById(any())).thenReturn(Collections.emptyList());

        // when
        Page<DiagnosisListItem> result = diagnosisQueryService.listDiagnoses(pageable);

        // then
        assertEquals(1, result.getTotalElements());
        assertEquals("진단지", result.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("진단지 상세 조회 성공")
    void getDiagnosisDetail_Success() {
        // given
        Long diagnosisId = 1L;
        Semester semester = Semester.builder().build();
        ReflectionTestUtils.setField(semester, "semesterId", 10L);

        DiagnosisRun run = DiagnosisRun.builder()
                .runId(diagnosisId)
                .title("진단지")
                .semester(semester)
                .status(DiagnosisRunStatus.OPEN)
                .build();

        when(diagnosisRunRepository.findById(diagnosisId)).thenReturn(Optional.of(run));
        when(diagnosisQuestionRepository.findByRunRunIdOrderBySortOrderAsc(diagnosisId))
                .thenReturn(Collections.emptyList());

        // when
        DiagnosisDetailResponse response = diagnosisQueryService.getDiagnosisDetail(diagnosisId);

        // then
        assertEquals("진단지", response.getBasicInfo().getTitle());
        assertTrue(response.getQuestions().isEmpty());
    }

    @Test
    @DisplayName("진단 리포트 조회 - 통계 계산 검증")
    void getDiagnosisReport_Success_Math() {
        // given
        Long runId = 1L;
        Semester semester = Semester.builder().build();
        ReflectionTestUtils.setField(semester, "semesterId", 10L);

        DiagnosisRun run = DiagnosisRun.builder()
                .runId(runId)
                .semester(semester)
                .build();

        when(diagnosisRunRepository.findById(runId)).thenReturn(Optional.of(run));
        when(diagnosisTargetRepository.countByRunRunId(runId)).thenReturn(10L);

        Account stu1 = Account.builder().build();
        ReflectionTestUtils.setField(stu1, "accountId", 101L);
        Account stu2 = Account.builder().build();
        ReflectionTestUtils.setField(stu2, "accountId", 102L);

        DiagnosisSubmission sub1 = DiagnosisSubmission.builder().student(stu1).build();
        DiagnosisSubmission sub2 = DiagnosisSubmission.builder().student(stu2).build();
        when(diagnosisSubmissionRepository.findByRunRunId(runId)).thenReturn(List.of(sub1, sub2));

        Competency comp = Competency.builder().competencyId(1L).name("C1").sortOrder(1).build();
        when(competencyRepository.findAll()).thenReturn(new java.util.ArrayList<>(List.of(comp)));
        when(diagnosisRunRepository.findByStatus(any())).thenReturn(Collections.emptyList());

        SemesterStudentCompetencySummary s1 = SemesterStudentCompetencySummary.builder()
                .student(stu1).competency(comp).totalScore(new BigDecimal("40.00")).calculatedAt(LocalDateTime.now())
                .build();
        SemesterStudentCompetencySummary s2 = SemesterStudentCompetencySummary.builder()
                .student(stu2).competency(comp).totalScore(new BigDecimal("60.00")).calculatedAt(LocalDateTime.now())
                .build();
        when(summaryRepository.findBySemesterSemesterId(10L)).thenReturn(List.of(s1, s2));

        // when
        DiagnosisReportResponse response = diagnosisQueryService.getDiagnosisReport(runId);

        // then

        assertEquals(new BigDecimal("50.00"), response.getSummary().getTotalAverage());
        assertEquals(new BigDecimal("50.00"), response.getStatsTable().get(0).getMean());
        assertEquals(new BigDecimal("50.00"), response.getStatsTable().get(0).getMedian());
        assertEquals(new BigDecimal("10.00"), response.getStatsTable().get(0).getStdDev());
    }

    @Test
    @DisplayName("진단 상세 조회 실패 - 존재하지 않음")
    void getDiagnosisDetail_Fail_NotFound() {
        // given
        when(diagnosisRunRepository.findById(1L)).thenReturn(Optional.empty());

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> diagnosisQueryService.getDiagnosisDetail(1L));
        assertEquals(ErrorCode.DIAGNOSIS_NOT_FOUND, ex.getErrorCode());
    }
}
