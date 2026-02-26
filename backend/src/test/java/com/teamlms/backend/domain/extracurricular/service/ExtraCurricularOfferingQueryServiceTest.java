package com.teamlms.backend.domain.extracurricular.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
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

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingUserListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingItem;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class ExtraCurricularOfferingQueryServiceTest {

    @InjectMocks
    private ExtraCurricularOfferingQueryService extraCurricularOfferingQueryService;

    @Mock
    private ExtraCurricularOfferingRepository offeringRepository;
    @Mock
    private ExtraCurricularOfferingCompetencyMapRepository offeringCompetencyMapRepository;
    @Mock
    private ExtraCurricularApplicationRepository applicationRepository;

    @Test
    @DisplayName("개설 리스트 조회 (관리자)")
    void list_Success() {
        // given
        Long semesterId = 1L;
        String keyword = "비교과";
        Pageable pageable = PageRequest.of(0, 10);

        ExtraCurricularOfferingListItem item = new ExtraCurricularOfferingListItem(
                1L, "OFF01", "비교과 개설", "담당자", 10L, 5L, ExtraOfferingStatus.DRAFT);
        Page<ExtraCurricularOfferingListItem> pageResult = new PageImpl<>(List.of(item));

        when(offeringRepository.findAdminList(semesterId, keyword, pageable)).thenReturn(pageResult);

        // when
        Page<ExtraCurricularOfferingListItem> result = extraCurricularOfferingQueryService.list(semesterId, keyword,
                pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("OFF01", result.getContent().get(0).extraOfferingCode());
    }

    @Test
    @DisplayName("개설 리스트 조회 (사용자)")
    void listForUser_Success() {
        // given
        String keyword = "비교과";
        Pageable pageable = PageRequest.of(0, 10);

        ExtraCurricularOfferingUserListItem item = new ExtraCurricularOfferingUserListItem(
                1L, "OFF01", "비교과 개설", "담당자", 10L, 5L);
        Page<ExtraCurricularOfferingUserListItem> pageResult = new PageImpl<>(List.of(item));

        when(offeringRepository.findOfferingUserList(keyword, pageable)).thenReturn(pageResult);

        // when
        Page<ExtraCurricularOfferingUserListItem> result = extraCurricularOfferingQueryService.listForUser(keyword,
                pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    @DisplayName("개설 기본 상세 조회 성공")
    void getBasicDetail_Success() {
        // given
        Long id = 1L;
        ExtraCurricularOfferingBasicDetailResponse response = new ExtraCurricularOfferingBasicDetailResponse(
                id, 1L, "EX01", "비교과", "학생처", "설명", "OFF01", "비교과 개설",
                0L, "담당자", "010-1234-5678", "test@test.com", 10L, 5L, 1L, "2024-1",
                LocalDateTime.now(), LocalDateTime.now().plusDays(10), ExtraOfferingStatus.DRAFT);

        when(offeringRepository.findBasicDetailById(id)).thenReturn(response);

        // when
        ExtraCurricularOfferingBasicDetailResponse result = extraCurricularOfferingQueryService.getBasicDetail(id);

        // then
        assertNotNull(result);
        assertEquals(id, result.extraOfferingId());
        assertEquals("OFF01", result.extraOfferingCode());
    }

    @Test
    @DisplayName("개설 기본 상세 조회 실패 - 존재하지 않음")
    void getBasicDetail_Fail_NotFound() {
        // given
        Long id = 999L;
        when(offeringRepository.findBasicDetailById(id)).thenReturn(null);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> extraCurricularOfferingQueryService.getBasicDetail(id));

        assertEquals(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("역량 매핑 조회 성공")
    void getMapping_Success() {
        // given
        Long id = 1L;
        ExtraOfferingCompetencyMappingItem item = new ExtraOfferingCompetencyMappingItem(1L, "C01", "역량1", "설명", 1);
        List<ExtraOfferingCompetencyMappingItem> mappingList = List.of(item);

        when(offeringRepository.existsById(id)).thenReturn(true);
        when(offeringCompetencyMapRepository.findOfferingCompetencyMapping(id)).thenReturn(mappingList);

        // when
        List<ExtraOfferingCompetencyMappingItem> result = extraCurricularOfferingQueryService.getMapping(id);

        // then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("역량1", result.get(0).name());
    }
}
