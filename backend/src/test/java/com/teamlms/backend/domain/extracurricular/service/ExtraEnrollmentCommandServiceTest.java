package com.teamlms.backend.domain.extracurricular.service;

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

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularApplication;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class ExtraEnrollmentCommandServiceTest {

        @InjectMocks
        private ExtraEnrollmentCommandService extraEnrollmentCommandService;

        @Mock
        private ExtraCurricularOfferingRepository offeringRepository;
        @Mock
        private ExtraCurricularApplicationRepository applicationRepository;

        @Test
        @DisplayName("비교과 신청 성공 - 신규 신청")
        void enroll_Success_New() {
                // given
                Long offeringId = 1L;
                Long studentId = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.OPEN)
                                .build();

                when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(offering));
                when(applicationRepository.findByExtraOfferingIdAndStudentAccountId(offeringId, studentId))
                                .thenReturn(Optional.empty());

                // when
                extraEnrollmentCommandService.enroll(offeringId, studentId);

                // then
                verify(applicationRepository).save(any(ExtraCurricularApplication.class));
        }

        @Test
        @DisplayName("비교과 신청 성공 - 취소 후 재신청")
        void enroll_Success_ReApply() {
                // given
                Long offeringId = 1L;
                Long studentId = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.OPEN)
                                .build();
                ExtraCurricularApplication app = ExtraCurricularApplication.createApplied(offeringId, studentId, null);
                app.cancel(null); // Initial state is CANCELED

                when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(offering));
                when(applicationRepository.findByExtraOfferingIdAndStudentAccountId(offeringId, studentId))
                                .thenReturn(Optional.of(app));

                // when
                extraEnrollmentCommandService.enroll(offeringId, studentId);

                // then
                assertEquals(ExtraApplicationApplyStatus.APPLIED, app.getApplyStatus());
        }

        @Test
        @DisplayName("비교과 신청 실패 - 이미 신청됨")
        void enroll_Fail_AlreadyApplied() {
                // given
                Long offeringId = 1L;
                Long studentId = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.OPEN)
                                .build();
                ExtraCurricularApplication app = ExtraCurricularApplication.createApplied(offeringId, studentId, null);

                when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(offering));
                when(applicationRepository.findByExtraOfferingIdAndStudentAccountId(offeringId, studentId))
                                .thenReturn(Optional.of(app));

                // when & then
                BusinessException exception = assertThrows(BusinessException.class,
                                () -> extraEnrollmentCommandService.enroll(offeringId, studentId));

                assertEquals(ErrorCode.EXTRA_APPLICATION_ALREADY_EXISTS, exception.getErrorCode());
        }

        @Test
        @DisplayName("비교과 신청 취소 성공")
        void cancel_Success() {
                // given
                Long offeringId = 1L;
                Long studentId = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.OPEN)
                                .build();
                ExtraCurricularApplication app = ExtraCurricularApplication.createApplied(offeringId, studentId, null);

                when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(offering));
                when(applicationRepository.findByExtraOfferingIdAndStudentAccountId(offeringId, studentId))
                                .thenReturn(Optional.of(app));

                // when
                extraEnrollmentCommandService.cancel(offeringId, studentId);

                // then
                assertEquals(ExtraApplicationApplyStatus.CANCELED, app.getApplyStatus());
        }

        @Test
        @DisplayName("비교과 신청 취소 실패 - OPEN 상태가 아님")
        void cancel_Fail_NotOpen() {
                // given
                Long offeringId = 1L;
                Long studentId = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.IN_PROGRESS)
                                .build();

                when(offeringRepository.findById(offeringId)).thenReturn(Optional.of(offering));

                // when & then
                BusinessException exception = assertThrows(BusinessException.class,
                                () -> extraEnrollmentCommandService.cancel(offeringId, studentId));

                assertEquals(ErrorCode.OFFERING_NOT_ENROLLABLE, exception.getErrorCode());
        }
}
