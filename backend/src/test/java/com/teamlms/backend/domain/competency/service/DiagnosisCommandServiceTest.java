package com.teamlms.backend.domain.competency.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.competency.api.dto.*;
import com.teamlms.backend.domain.competency.entitiy.*;
import com.teamlms.backend.domain.competency.enums.*;
import com.teamlms.backend.domain.competency.repository.*;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiagnosisCommandServiceTest {

    @InjectMocks
    private DiagnosisCommandService diagnosisCommandService;

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
    private SemesterRepository semesterRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private CompetencySummaryService competencySummaryService;

    @Test
    @DisplayName("진단지 생성 성공")
    void createDiagnosis_Success() {
        // given
        DiagnosisCreateRequest req = DiagnosisCreateRequest.builder()
                .title("2024년 역량진단")
                .semesterId(1L)
                .targetGrade(1)
                .startedAt(LocalDateTime.now())
                .endedAt(LocalDateTime.now().plusDays(7))
                .problems(List.of(
                        DiagnosisProblemRequest.builder()
                                .title("문제1")
                                .type("SCALE")
                                .items(List.of(
                                        DiagnosisQuestionRequest.builder().text("질문1").order(1).build()))
                                .build()))
                .build();

        Semester semester = Semester.builder().build();
        ReflectionTestUtils.setField(semester, "semesterId", 1L);

        when(semesterRepository.findById(1L)).thenReturn(Optional.of(semester));
        when(diagnosisRunRepository.findBySemesterSemesterIdAndDeptIdIsNullAndTargetGrade(1L, 1))
                .thenReturn(Optional.empty());

        DiagnosisRun savedRun = DiagnosisRun.builder().runId(100L).build();
        when(diagnosisRunRepository.save(any(DiagnosisRun.class))).thenReturn(savedRun);

        // when
        Long runId = diagnosisCommandService.createDiagnosis(req);

        // then
        assertEquals(100L, runId);
        verify(diagnosisRunRepository).save(any(DiagnosisRun.class));
        verify(diagnosisQuestionRepository).save(any(DiagnosisQuestion.class));
        verify(studentProfileRepository).findAll(); // generateTargets internally calls this
    }

    @Test
    @DisplayName("진단지 생성 실패 - 중복된 진단지")
    void createDiagnosis_Fail_Duplicate() {
        // given
        DiagnosisCreateRequest req = DiagnosisCreateRequest.builder()
                .semesterId(1L)
                .targetGrade(1)
                .build();

        Semester semester = Semester.builder().build();
        when(semesterRepository.findById(1L)).thenReturn(Optional.of(semester));
        when(diagnosisRunRepository.findBySemesterSemesterIdAndDeptIdIsNullAndTargetGrade(1L, 1))
                .thenReturn(Optional.of(DiagnosisRun.builder().build()));

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> diagnosisCommandService.createDiagnosis(req));
        assertEquals(ErrorCode.DUPLICATE_DIAGNOSIS_FOR_SEMESTER, ex.getErrorCode());
    }

    @Test
    @DisplayName("진단지 수정 성공 - 상태 변경 및 종료일 연장")
    void updateDiagnosis_Success() {
        // given
        Long diagnosisId = 1L;
        DiagnosisPatchRequest req = DiagnosisPatchRequest.builder()
                .title("수정된 제목")
                .status("OPEN")
                .endedAt(LocalDateTime.now().plusDays(10))
                .build();

        DiagnosisRun diagnosisRun = DiagnosisRun.builder()
                .runId(diagnosisId)
                .status(DiagnosisRunStatus.DRAFT)
                .startAt(LocalDateTime.now().minusDays(1))
                .endAt(LocalDateTime.now().plusDays(5))
                .build();

        when(diagnosisRunRepository.findById(diagnosisId)).thenReturn(Optional.of(diagnosisRun));

        // when
        diagnosisCommandService.updateDiagnosis(diagnosisId, req);

        // then
        verify(diagnosisRunRepository).save(any(DiagnosisRun.class));
    }

    @Test
    @DisplayName("진단지 수정 실패 - 종료된 진단")
    void updateDiagnosis_Fail_Closed() {
        // given
        Long diagnosisId = 1L;
        DiagnosisPatchRequest req = DiagnosisPatchRequest.builder().title("제목").build();

        DiagnosisRun diagnosisRun = DiagnosisRun.builder()
                .status(DiagnosisRunStatus.CLOSED)
                .build();

        when(diagnosisRunRepository.findById(diagnosisId)).thenReturn(Optional.of(diagnosisRun));

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> diagnosisCommandService.updateDiagnosis(diagnosisId, req));
        assertEquals(ErrorCode.CANNOT_MODIFY_CLOSED_DIAGNOSIS, ex.getErrorCode());
    }

    @Test
    @DisplayName("진단지 삭제 성공")
    void deleteDiagnosis_Success() {
        // given
        Long diagnosisId = 1L;
        DiagnosisRun diagnosisRun = DiagnosisRun.builder().runId(diagnosisId).build();

        when(diagnosisRunRepository.findById(diagnosisId)).thenReturn(Optional.of(diagnosisRun));
        when(diagnosisSubmissionRepository.countByRunRunId(diagnosisId)).thenReturn(0L);

        // when
        diagnosisCommandService.deleteDiagnosis(diagnosisId);

        // then
        verify(diagnosisQuestionRepository).deleteByRunRunId(diagnosisId);
        verify(diagnosisTargetRepository).deleteByRunRunId(diagnosisId);
        verify(diagnosisRunRepository).delete(diagnosisRun);
    }

    @Test
    @DisplayName("진단지 삭제 실패 - 제출 내역 존재")
    void deleteDiagnosis_Fail_HasSubmissions() {
        // given
        Long diagnosisId = 1L;
        DiagnosisRun diagnosisRun = DiagnosisRun.builder().runId(diagnosisId).build();

        when(diagnosisRunRepository.findById(diagnosisId)).thenReturn(Optional.of(diagnosisRun));
        when(diagnosisSubmissionRepository.countByRunRunId(diagnosisId)).thenReturn(5L);

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> diagnosisCommandService.deleteDiagnosis(diagnosisId));
        assertEquals(ErrorCode.CANNOT_DELETE_DIAGNOSIS_WITH_SUBMISSIONS, ex.getErrorCode());
    }

    @Test
    @DisplayName("진단 제출 성공")
    void submitDiagnosis_Success() {
        // given
        Long diagnosisId = 1L;
        Long accountId = 10L;
        DiagnosisSubmitRequest req = new DiagnosisSubmitRequest();
        DiagnosisSubmitRequest.AnswerSubmitItem item = new DiagnosisSubmitRequest.AnswerSubmitItem();
        item.setQuestionId(200L);
        item.setScaleValue(5);
        req.setAnswers(List.of(item));

        DiagnosisRun run = DiagnosisRun.builder()
                .semester(Semester.builder().build())
                .build();
        ReflectionTestUtils.setField(run.getSemester(), "semesterId", 5L);

        Account student = Account.builder().build();
        DiagnosisTarget target = DiagnosisTarget.builder()
                .targetId(500L)
                .run(run)
                .student(student)
                .status(DiagnosisTargetStatus.PENDING)
                .build();

        when(diagnosisTargetRepository.findByRunRunIdAndStudentAccountId(diagnosisId, accountId))
                .thenReturn(Optional.of(target));

        DiagnosisQuestion question = DiagnosisQuestion.builder()
                .questionId(200L)
                .questionType(DiagnosisQuestionType.SCALE)
                .build();
        when(diagnosisQuestionRepository.findByRunRunIdOrderBySortOrderAsc(diagnosisId))
                .thenReturn(List.of(question));

        // when
        diagnosisCommandService.submitDiagnosis(diagnosisId, accountId, req);

        // then
        verify(diagnosisSubmissionRepository).save(any(DiagnosisSubmission.class));
        verify(diagnosisAnswerRepository).save(any(DiagnosisAnswer.class));
        verify(diagnosisTargetRepository).save(any(DiagnosisTarget.class));
        verify(competencySummaryService).recalculateStudentSummary(5L, accountId);
    }
}
