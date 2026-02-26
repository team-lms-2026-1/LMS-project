package com.teamlms.backend.domain.extracurricular.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.teamlms.backend.domain.competency.repository.CompetencyRepository;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingCreateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingPatchRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingBulkUpdateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingPatchRequest;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionCompletionRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class ExtraCurricularOfferingCommandServiceTest {

        @InjectMocks
        private ExtraCurricularOfferingCommandService extraCurricularOfferingCommandService;

        @Mock
        private ExtraCurricularOfferingRepository offeringRepository;
        @Mock
        private ExtraCurricularSessionRepository sessionRepository;
        @Mock
        private ExtraCurricularSessionCompletionRepository completionRepository;
        @Mock
        private ExtraCurricularApplicationRepository applicationRepository;
        @Mock
        private CompetencyRepository competencyRepository;
        @Mock
        private ExtraCurricularOfferingCompetencyMapRepository competencyMapRepository;

        @Test
        @DisplayName("개설 생성 성공")
        void create_Success() {
                // given
                LocalDateTime start = LocalDateTime.now().plusDays(1);
                LocalDateTime end = LocalDateTime.now().plusDays(10);
                ExtraCurricularOfferingCreateRequest req = new ExtraCurricularOfferingCreateRequest(
                                1L, "OFF01", "비교과 개설", "담당자", "010-1234-5678", "test@test.com",
                                10L, 5L, 1L, start, end);

                when(offeringRepository.existsByExtraOfferingCode("OFF01")).thenReturn(false);

                // when
                extraCurricularOfferingCommandService.create(req);

                // then
                verify(offeringRepository).save(argThat(offering -> offering.getExtraOfferingCode().equals("OFF01") &&
                                offering.getExtraOfferingName().equals("비교과 개설") &&
                                offering.getStatus() == ExtraOfferingStatus.DRAFT));
        }

        @Test
        @DisplayName("개설 생성 실패 - 기간 부적절")
        void create_Fail_PeriodInvalid() {
                // given
                LocalDateTime start = LocalDateTime.now().plusDays(10);
                LocalDateTime end = LocalDateTime.now().plusDays(1);
                ExtraCurricularOfferingCreateRequest req = new ExtraCurricularOfferingCreateRequest(
                                1L, "OFF01", "비교과 개설", "담당자", "010-1234-5678", "test@test.com",
                                10L, 5L, 1L, start, end);

                // when & then
                BusinessException exception = assertThrows(BusinessException.class,
                                () -> extraCurricularOfferingCommandService.create(req));

                assertEquals(ErrorCode.EXTRA_CURRICULAR_OFFERING_PERIOD_INVALID, exception.getErrorCode());
        }

        @Test
        @DisplayName("개설 수정 성공 (DRAFT 상태)")
        void patch_Success() {
                // given
                Long id = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.DRAFT)
                                .operationStartAt(LocalDateTime.now())
                                .operationEndAt(LocalDateTime.now().plusDays(5))
                                .build();

                ExtraCurricularOfferingPatchRequest req = new ExtraCurricularOfferingPatchRequest(
                                "NEW_CODE", "New Name", "New Contact", "010-0000-0000", "new@test.com",
                                20L, 10L, 2L, LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(10));

                when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));
                when(offeringRepository.existsByExtraOfferingCodeAndExtraOfferingIdNot("NEW_CODE", id))
                                .thenReturn(false);

                // when
                extraCurricularOfferingCommandService.patch(id, req);

                // then
                assertEquals("NEW_CODE", offering.getExtraOfferingCode());
                assertEquals("New Name", offering.getExtraOfferingName());
        }

        @Test
        @DisplayName("개설 수정 실패 - DRAFT 상태가 아님")
        void patch_Fail_NotDraft() {
                // given
                Long id = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.OPEN)
                                .build();

                ExtraCurricularOfferingPatchRequest req = new ExtraCurricularOfferingPatchRequest(
                                "NEW_CODE", "Name", null, null, null, null, null, null, null, null);

                when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));

                // when & then
                BusinessException exception = assertThrows(BusinessException.class,
                                () -> extraCurricularOfferingCommandService.patch(id, req));

                assertEquals(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_EDITABLE, exception.getErrorCode());
        }

        @Test
        @DisplayName("상태 변경 성공 - DRAFT to OPEN")
        void changeStatus_Success() {
                // given
                Long id = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.DRAFT)
                                .build();

                when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));

                // when
                extraCurricularOfferingCommandService.changeStatus(id, ExtraOfferingStatus.OPEN);

                // then
                assertEquals(ExtraOfferingStatus.OPEN, offering.getStatus());
        }

        @Test
        @DisplayName("상태 변경 실패 - 잘못된 전이")
        void changeStatus_Fail_InvalidTransition() {
                // given
                Long id = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.DRAFT)
                                .build();

                when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));

                // when & then
                BusinessException exception = assertThrows(BusinessException.class,
                                () -> extraCurricularOfferingCommandService.changeStatus(id,
                                                ExtraOfferingStatus.COMPLETED));

                assertEquals(ErrorCode.INVALID_EXTRA_CURRICULAR_OFFERING_STATUS_TRANSITION, exception.getErrorCode());
        }

        @Test
        @DisplayName("역량 매핑 수정 성공")
        void patchMapping_Success() {
                // given
                Long id = 1L;
                ExtraCurricularOffering offering = ExtraCurricularOffering.builder()
                                .status(ExtraOfferingStatus.DRAFT)
                                .build();

                List<ExtraOfferingCompetencyMappingPatchRequest> mappings = List.of(
                                new ExtraOfferingCompetencyMappingPatchRequest(1L, 1),
                                new ExtraOfferingCompetencyMappingPatchRequest(2L, 2));
                ExtraOfferingCompetencyMappingBulkUpdateRequest req = new ExtraOfferingCompetencyMappingBulkUpdateRequest(
                                mappings);

                when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));
                when(competencyRepository.countByCompetencyIdIn(anyList())).thenReturn(2L);

                // when
                extraCurricularOfferingCommandService.patchMapping(id, req);

                // then
                verify(competencyMapRepository).deleteByIdExtraOfferingId(id);
                verify(competencyMapRepository).saveAll(anyList());
        }
}
