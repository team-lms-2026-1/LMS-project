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

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingItem;
import com.teamlms.backend.domain.curricular.api.dto.OfferingStudentListItem;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.curricular.repository.EnrollmentRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class CurricularOfferingQueryServiceTest {

    @InjectMocks
    private CurricularOfferingQueryService queryService;

    @Mock
    private CurricularOfferingRepository curricularOfferingRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private CurricularOfferingCompetencyMapRepository curricularOfferingCompetencyMapRepository;

    @Test
    @DisplayName("관리자용 개설교과 목록 조회 성공")
    void listForAdmin_Success() {
        // given
        Long semesterId = 1L;
        String keyword = "test";
        Pageable pageable = PageRequest.of(0, 10);

        CurricularOfferingListItem item = mock(CurricularOfferingListItem.class);
        Page<CurricularOfferingListItem> mockPage = new PageImpl<>(List.of(item), pageable, 1);

        when(curricularOfferingRepository.findOfferingAdminList(eq(semesterId), eq(keyword), eq(pageable)))
                .thenReturn(mockPage);

        // when
        Page<CurricularOfferingListItem> result = queryService.listForAdmin(semesterId, keyword, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(curricularOfferingRepository).findOfferingAdminList(eq(semesterId), eq(keyword), eq(pageable));
    }

    @Test
    @DisplayName("교수용 개설교과 상세 조회 실패 - 본인 강의 아님")
    void getDetailForProfessor_Fail_NotOwner() {
        // given
        Long professorAccountId = 1L;
        Long offeringId = 2L;

        when(curricularOfferingRepository.existsByOfferingIdAndProfessorAccountId(offeringId, professorAccountId))
                .thenReturn(false);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> queryService.getDetailForProfessor(professorAccountId, offeringId));
        assertEquals(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("교수용 개설교과 상세 조회 성공")
    void getDetailForProfessor_Success() {
        // given
        Long professorAccountId = 1L;
        Long offeringId = 2L;

        when(curricularOfferingRepository.existsByOfferingIdAndProfessorAccountId(offeringId, professorAccountId))
                .thenReturn(true);

        CurricularOfferingDetailResponse response = mock(CurricularOfferingDetailResponse.class);
        when(curricularOfferingRepository.findOfferingDetail(offeringId)).thenReturn(response);

        // when
        CurricularOfferingDetailResponse result = queryService.getDetailForProfessor(professorAccountId, offeringId);

        // then
        assertNotNull(result);
        verify(curricularOfferingRepository).findOfferingDetail(offeringId);
    }

    @Test
    @DisplayName("학생 목록 페이지 조회 성공")
    void listStudents_Success() {
        // given
        Long offeringId = 1L;
        String keyword = "student";
        Pageable pageable = PageRequest.of(0, 10);

        OfferingStudentListItem item = mock(OfferingStudentListItem.class);
        Page<OfferingStudentListItem> mockPage = new PageImpl<>(List.of(item), pageable, 1);

        when(enrollmentRepository.findStudentsByOffering(eq(offeringId), eq(keyword), eq(pageable)))
                .thenReturn(mockPage);

        // when
        Page<OfferingStudentListItem> result = queryService.listStudents(offeringId, keyword, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(enrollmentRepository).findStudentsByOffering(eq(offeringId), eq(keyword), eq(pageable));
    }

    @Test
    @DisplayName("역량 매핑 정보 조회 성공")
    void getMapping_Success() {
        // given
        Long offeringId = 1L;
        OfferingCompetencyMappingItem item = mock(OfferingCompetencyMappingItem.class);

        when(curricularOfferingRepository.existsById(offeringId)).thenReturn(true);
        when(curricularOfferingCompetencyMapRepository.findOfferingCompetencyMapping(offeringId))
                .thenReturn(List.of(item));

        // when
        List<OfferingCompetencyMappingItem> result = queryService.getMapping(offeringId);

        // then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(curricularOfferingCompetencyMapRepository).findOfferingCompetencyMapping(offeringId);
    }

    @Test
    @DisplayName("역량 매핑 정보 조회 실패 - 교과가 존재하지 않음")
    void getMapping_Fail_NotFound() {
        // given
        Long offeringId = 1L;

        when(curricularOfferingRepository.existsById(offeringId)).thenReturn(false);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> queryService.getMapping(offeringId));
        assertEquals(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, exception.getErrorCode());
    }
}
