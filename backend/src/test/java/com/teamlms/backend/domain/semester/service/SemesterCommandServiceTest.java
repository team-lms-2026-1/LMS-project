package com.teamlms.backend.domain.semester.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.teamlms.backend.domain.competency.repository.DiagnosisRunRepository;
import com.teamlms.backend.domain.competency.repository.SemesterCompetencyCohortStatRepository;
import com.teamlms.backend.domain.competency.repository.SemesterStudentCompetencySummaryRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringRecruitmentRepository;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.enums.SemesterStatus;
import com.teamlms.backend.domain.semester.enums.Term;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class SemesterCommandServiceTest {

    @InjectMocks
    private SemesterCommandService semesterCommandService;

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private CurricularOfferingRepository curricularOfferingRepository;

    @Mock
    private ExtraCurricularOfferingRepository extraCurricularOfferingRepository;

    @Mock
    private MentoringRecruitmentRepository mentoringRecruitmentRepository;

    @Mock
    private DiagnosisRunRepository diagnosisRunRepository;

    @Mock
    private SemesterStudentCompetencySummaryRepository semesterStudentCompetencySummaryRepository;

    @Mock
    private SemesterCompetencyCohortStatRepository semesterCompetencyCohortStatRepository;

    @Test
    @DisplayName("학기 생성 성공")
    void create_Success() {
        // given
        int year = 2024;
        Term term = Term.FIRST;
        LocalDate startDate = LocalDate.of(2024, 3, 1);
        LocalDate endDate = LocalDate.of(2024, 6, 20);

        when(semesterRepository.existsByYearAndTerm(year, term)).thenReturn(false);

        // when
        semesterCommandService.create(year, term, startDate, endDate);

        // then
        verify(semesterRepository, times(1)).save(any(Semester.class));
    }

    @Test
    @DisplayName("학기 생성 실패 - 이미 존재하는 학기")
    void create_Fail_AlreadyExists() {
        // given
        int year = 2024;
        Term term = Term.FIRST;
        LocalDate startDate = LocalDate.of(2024, 3, 1);
        LocalDate endDate = LocalDate.of(2024, 6, 20);

        when(semesterRepository.existsByYearAndTerm(year, term)).thenReturn(true);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> semesterCommandService.create(year, term, startDate, endDate));
        assertEquals(ErrorCode.SEMESTER_ALREADY_EXISTS, exception.getErrorCode());
    }

    @Test
    @DisplayName("학기 생성 실패 - 잘못된 기간 설정")
    void create_Fail_InvalidDateRange() {
        // given
        int year = 2024;
        Term term = Term.FIRST;
        LocalDate startDate = LocalDate.of(2024, 6, 20);
        LocalDate endDate = LocalDate.of(2024, 3, 1); // 종료일이 시작일보다 빠름

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> semesterCommandService.create(year, term, startDate, endDate));
        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
    }

    @Test
    @DisplayName("학기 수정 및 상태 변경 성공")
    void patchSemester_Success() {
        // given
        Long semesterId = 1L;
        LocalDate startDate = LocalDate.of(2024, 3, 1);
        LocalDate endDate = LocalDate.of(2024, 6, 30);
        SemesterStatus status = SemesterStatus.ACTIVE;

        Semester semester = Semester.builder()
                .semesterId(semesterId)
                .startDate(startDate)
                .endDate(endDate)
                .status(SemesterStatus.PLANNED)
                .build();

        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        // when
        semesterCommandService.patchSemester(semesterId, startDate, endDate, status);

        // then
        assertEquals(status, semester.getStatus());
    }

    @Test
    @DisplayName("학기 종료(CLOSED) 실패 - 연관 데이터 존재")
    void patchSemester_Fail_CloseNotAllowed_DueToCurricular() {
        // given
        Long semesterId = 1L;
        Semester semester = Semester.builder()
                .semesterId(semesterId)
                .status(SemesterStatus.ACTIVE)
                .build();

        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(curricularOfferingRepository.existsBySemesterId(semesterId)).thenReturn(true);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> semesterCommandService.patchSemester(semesterId, null, null, SemesterStatus.CLOSED));
        assertEquals(ErrorCode.SEMESTER_DEACTIVATE_NOT_ALLOWED, exception.getErrorCode());
    }
}
