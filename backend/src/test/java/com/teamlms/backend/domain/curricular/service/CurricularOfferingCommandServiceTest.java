package com.teamlms.backend.domain.curricular.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.competency.repository.CompetencyRepository;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUpdateRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingBulkUpdateRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingPatchRequest;
import com.teamlms.backend.domain.curricular.entity.CurricularOffering;
import com.teamlms.backend.domain.curricular.entity.Enrollment;
import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;
import com.teamlms.backend.domain.curricular.enums.EnrollmentStatus;
import com.teamlms.backend.domain.curricular.enums.OfferingStatus;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularRepository;
import com.teamlms.backend.domain.curricular.repository.EnrollmentRepository;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class CurricularOfferingCommandServiceTest {

    @InjectMocks
    private CurricularOfferingCommandService offeringCommandService;

    @Mock
    private CurricularRepository curricularRepository;
    @Mock
    private CurricularOfferingRepository curricularOfferingRepository;
    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private ProfessorProfileRepository professorProfileRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private CurricularOfferingCompetencyMapRepository competencyMapRepository;
    @Mock
    private CompetencyRepository competencyRepository;

    @Test
    @DisplayName("개설교과 생성 성공")
    void create_Success() {
        // given
        Long professorId = 1L;
        Long curricularId = 2L;
        Long semesterId = 3L;

        Account professor = mock(Account.class);
        when(professor.getAccountType()).thenReturn(AccountType.PROFESSOR);

        when(accountRepository.findById(professorId)).thenReturn(Optional.of(professor));
        when(professorProfileRepository.existsById(professorId)).thenReturn(true);
        when(curricularRepository.existsById(curricularId)).thenReturn(true);
        when(semesterRepository.existsById(semesterId)).thenReturn(true);
        when(curricularOfferingRepository.existsByCurricularIdAndSemesterId(curricularId, semesterId))
                .thenReturn(false);
        when(curricularOfferingRepository.existsByOfferingCode("OFF001")).thenReturn(false);

        // when
        offeringCommandService.create(
                "OFF001", curricularId, semesterId, DayOfWeekType.MONDAY, 1, 30, "Room 101", professorId);

        // then
        verify(curricularOfferingRepository).save(any(CurricularOffering.class));
    }

    @Test
    @DisplayName("기본 수정 성공 (DRAFT 상태)")
    void patchBasic_Success() {
        // given
        Long offeringId = 1L;
        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.DRAFT)
                .offeringCode("OLD_CODE")
                .build();

        CurricularOffering spyOffering = spy(offering);
        when(curricularOfferingRepository.findById(offeringId)).thenReturn(Optional.of(spyOffering));

        CurricularOfferingUpdateRequest req = new CurricularOfferingUpdateRequest(
                "NEW_CODE", null, DayOfWeekType.FRIDAY, 2, 40, "Room 202", null);

        // when
        offeringCommandService.patchBasic(offeringId, req);

        // then
        verify(spyOffering).patchForDraft("NEW_CODE", null, DayOfWeekType.FRIDAY, 2, 40, "Room 202", null);
        assertEquals("NEW_CODE", spyOffering.getOfferingCode());
    }

    @Test
    @DisplayName("상태 변경 성공 - DRAFT -> OPEN")
    void changeStatus_DraftToOpen_Success() {
        // given
        Long offeringId = 1L;
        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.DRAFT)
                .build();
        CurricularOffering spyOffering = spy(offering);

        when(curricularOfferingRepository.findById(offeringId)).thenReturn(Optional.of(spyOffering));

        // when
        offeringCommandService.changeStatus(offeringId, OfferingStatus.OPEN, 1L);

        // then
        verify(spyOffering).changeStatus(OfferingStatus.OPEN);
        assertEquals(OfferingStatus.OPEN, spyOffering.getStatus());
    }

    @Test
    @DisplayName("상태 변경 실패 - 잠금 상태(COMPLETED) 변경 시도")
    void changeStatus_Fail_Locked() {
        // given
        Long offeringId = 1L;
        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.COMPLETED)
                .build();

        when(curricularOfferingRepository.findById(offeringId)).thenReturn(Optional.of(offering));

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> offeringCommandService.changeStatus(offeringId, OfferingStatus.OPEN, 1L));
        assertEquals(ErrorCode.CURRICULAR_OFFERING_STATUS_LOCKED, exception.getErrorCode());
    }

    @Test
    @DisplayName("역량 맵핑 성공")
    void patchMapping_Success() {
        // given
        Long offeringId = 1L;
        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.DRAFT)
                .build();

        when(curricularOfferingRepository.findById(offeringId)).thenReturn(Optional.of(offering));

        List<OfferingCompetencyMappingPatchRequest> mappings = List.of(
                new OfferingCompetencyMappingPatchRequest(1L, 1),
                new OfferingCompetencyMappingPatchRequest(2L, 2));
        OfferingCompetencyMappingBulkUpdateRequest req = new OfferingCompetencyMappingBulkUpdateRequest(mappings);

        when(competencyRepository.countByCompetencyIdIn(anyList())).thenReturn(2L); // 2 distinct competences

        // when
        offeringCommandService.patchMapping(offeringId, req);

        // then
        verify(competencyMapRepository).deleteByIdOfferingId(offeringId);
        verify(competencyMapRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("학생 성적 입력 성공")
    void patchScore_Success() {
        // given
        Long offeringId = 1L;
        Long enrollmentId = 2L;

        CurricularOffering offering = CurricularOffering.builder()
                .status(OfferingStatus.IN_PROGRESS)
                .build();

        when(curricularOfferingRepository.findById(offeringId)).thenReturn(Optional.of(offering));

        Enrollment enrollment = mock(Enrollment.class);
        when(enrollment.getOfferingId()).thenReturn(offeringId);
        when(enrollment.getEnrollmentStatus()).thenReturn(EnrollmentStatus.ENROLLED);
        when(enrollment.getIsGradeConfirmed()).thenReturn(false);
        when(enrollmentRepository.findById(enrollmentId)).thenReturn(Optional.of(enrollment));

        // when
        offeringCommandService.patchScore(offeringId, enrollmentId, 95);

        // then
        verify(enrollment).updateRawScore(95);
    }
}
