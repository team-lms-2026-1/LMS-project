package com.teamlms.backend.domain.extracurricular.service;

import static org.junit.jupiter.api.Assertions.*;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularDropdownItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularPatchForm;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricular;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class ExtraCurricularQueryServiceTest {

    @InjectMocks
    private ExtraCurricularQueryService extraCurricularQueryService;

    @Mock
    private ExtraCurricularRepository extraCurricularRepository;

    @Test
    @DisplayName("비교과 수정 폼 조회 성공")
    void editForm_Success() {
        // given
        Long id = 1L;
        ExtraCurricular extraCurricular = ExtraCurricular.builder()
                .extraCurricularCode("EXTRA01")
                .extraCurricularName("봉사활동")
                .description("설명")
                .hostOrgName("학생처")
                .isActive(true)
                .build();

        when(extraCurricularRepository.findById(id)).thenReturn(Optional.of(extraCurricular));

        // when
        ExtraCurricularPatchForm result = extraCurricularQueryService.editForm(id);

        // then
        assertNotNull(result);
        assertEquals(extraCurricular.getExtraCurricularName(), result.extraCurricularName());
        assertEquals(extraCurricular.getDescription(), result.description());
        assertEquals(extraCurricular.getHostOrgName(), result.hostOrgName());
        assertEquals(extraCurricular.getIsActive(), result.isActive());
    }

    @Test
    @DisplayName("비교과 수정 폼 조회 실패 - 존재하지 않음")
    void editForm_Fail_NotFound() {
        // given
        Long id = 999L;
        when(extraCurricularRepository.findById(id)).thenReturn(Optional.empty());

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> extraCurricularQueryService.editForm(id));

        assertEquals(ErrorCode.EXTRA_CURRICULAR_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("비교과 리스트 조회 성공")
    void list_Success() {
        // given
        String keyword = "봉사";
        Pageable pageable = PageRequest.of(0, 10);

        ExtraCurricularListItem item = new ExtraCurricularListItem(
                1L, "EXTRA01", "봉사활동", "학생처", true, LocalDateTime.now());
        Page<ExtraCurricularListItem> pageResult = new PageImpl<>(List.of(item));

        when(extraCurricularRepository.findList(keyword, pageable)).thenReturn(pageResult);

        // when
        Page<ExtraCurricularListItem> result = extraCurricularQueryService.list(keyword, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("봉사활동", result.getContent().get(0).extraCurricularName());
    }

    @Test
    @DisplayName("비교과 드롭다운 조회 성공")
    void getExtraCurricularDropdown_Success() {
        // given
        ExtraCurricular extraCurricular = ExtraCurricular.builder()
                .extraCurricularCode("EXTRA01")
                .extraCurricularName("봉사활동")
                .description("설명")
                .hostOrgName("학생처")
                .isActive(true)
                .build();

        when(extraCurricularRepository.findActiveForDropdown()).thenReturn(List.of(extraCurricular));

        // when
        List<ExtraCurricularDropdownItem> result = extraCurricularQueryService.getExtraCurricularDropdown();

        // then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(extraCurricular.getExtraCurricularName(), result.get(0).name());
    }
}
