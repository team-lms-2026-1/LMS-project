package com.teamlms.backend.domain.curricular.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.teamlms.backend.domain.curricular.entity.CurricularOffering;
import com.teamlms.backend.domain.curricular.entity.Enrollment;
import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;
import com.teamlms.backend.domain.curricular.enums.EnrollmentStatus;
import com.teamlms.backend.domain.curricular.enums.OfferingStatus;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.curricular.repository.EnrollmentRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class EnrollmentCommandServiceTest {

    @InjectMocks
    private EnrollmentCommandService enrollmentCommandService;

    @Mock
    private CurricularOfferingRepository offeringRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Test
    @DisplayName("수강신청 성공 - 신규 신청")
    void enroll_Success_New() {
        // given
        Long offeringId = 1L;
        Long studentId = 2L;

        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.OPEN)
                .capacity(30)
                .semesterId(10L)
                .dayOfWeek(DayOfWeekType.MONDAY)
                .period(1)
                .build();
        CurricularOffering spyOffering = spy(offering);

        when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(spyOffering));
        when(enrollmentRepository.countScheduleConflictEnrollment(studentId, 10L, DayOfWeekType.MONDAY, 1, offeringId))
                .thenReturn(0L);
        when(enrollmentRepository.findByOfferingIdAndStudentAccountId(offeringId, studentId))
                .thenReturn(Optional.empty());
        when(enrollmentRepository.countByOfferingIdAndEnrollmentStatus(offeringId, EnrollmentStatus.ENROLLED))
                .thenReturn(10L); // 10명 이미 신청

        // when
        enrollmentCommandService.enroll(offeringId, studentId);

        // then
        verify(enrollmentRepository).save(any(Enrollment.class));
        verify(spyOffering, never()).changeStatus(OfferingStatus.ENROLLMENT_CLOSED);
    }

    @Test
    @DisplayName("수강신청 성공 - 정원 가득 참 (자동 닫힘)")
    void enroll_Success_FullCapacity() {
        // given
        Long offeringId = 1L;
        Long studentId = 2L;

        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.OPEN)
                .capacity(30)
                .semesterId(10L)
                .dayOfWeek(DayOfWeekType.MONDAY)
                .period(1)
                .build();
        CurricularOffering spyOffering = spy(offering);

        when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(spyOffering));
        when(enrollmentRepository.countScheduleConflictEnrollment(studentId, 10L, DayOfWeekType.MONDAY, 1, offeringId))
                .thenReturn(0L);
        when(enrollmentRepository.findByOfferingIdAndStudentAccountId(offeringId, studentId))
                .thenReturn(Optional.empty());
        // save 호출 후 count 결과 모의
        when(enrollmentRepository.countByOfferingIdAndEnrollmentStatus(offeringId, EnrollmentStatus.ENROLLED))
                .thenReturn(29L) // 처음엔 29명 이었음
                .thenReturn(30L); // 저장 후엔 30명이 됨

        // when
        enrollmentCommandService.enroll(offeringId, studentId);

        // then
        verify(enrollmentRepository).save(any(Enrollment.class));
        verify(spyOffering).changeStatus(OfferingStatus.ENROLLMENT_CLOSED); // 이제 정원이 꽉 차서 닫힘 검증
    }

    @Test
    @DisplayName("수강신청 실패 - 강좌가 열려있지 않음")
    void enroll_Fail_NotOpen() {
        // given
        Long offeringId = 1L;
        Long studentId = 2L;

        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.DRAFT)
                .build();
        when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(offering));

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> enrollmentCommandService.enroll(offeringId, studentId));
        assertEquals(ErrorCode.OFFERING_NOT_ENROLLABLE, exception.getErrorCode());
    }

    @Test
    @DisplayName("수강신청 실패 - 시간표 겹침")
    void enroll_Fail_ScheduleConflict() {
        // given
        Long offeringId = 1L;
        Long studentId = 2L;

        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.OPEN)
                .semesterId(10L)
                .dayOfWeek(DayOfWeekType.MONDAY)
                .period(1)
                .build();
        when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(offering));
        when(enrollmentRepository.countScheduleConflictEnrollment(studentId, 10L, DayOfWeekType.MONDAY, 1, offeringId))
                .thenReturn(1L);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> enrollmentCommandService.enroll(offeringId, studentId));
        assertEquals(ErrorCode.ENROLLMENT_SCHEDULE_CONFLICT, exception.getErrorCode());
    }

    @Test
    @DisplayName("수강신청 취소 성공 - 여석 발생으로 인해 상태가 OPEN으로 변경")
    void cancel_Success_ChangeToOpen() {
        // given
        Long offeringId = 1L;
        Long studentId = 2L;

        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.ENROLLMENT_CLOSED)
                .capacity(30)
                .build();
        CurricularOffering spyOffering = spy(offering);

        Enrollment enrollment = mock(Enrollment.class);
        when(enrollment.getEnrollmentStatus()).thenReturn(EnrollmentStatus.ENROLLED);

        when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(spyOffering));
        when(enrollmentRepository.findByOfferingIdAndStudentAccountId(offeringId, studentId))
                .thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.countByOfferingIdAndEnrollmentStatus(offeringId, EnrollmentStatus.ENROLLED))
                .thenReturn(29L); // 취소 후 남은 인원

        // when
        enrollmentCommandService.cancel(offeringId, studentId);

        // then
        verify(enrollment).cancel();
        verify(spyOffering).changeStatus(OfferingStatus.OPEN);
    }
}
