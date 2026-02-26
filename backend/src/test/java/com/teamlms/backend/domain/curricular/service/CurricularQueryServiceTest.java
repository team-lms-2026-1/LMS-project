package com.teamlms.backend.domain.curricular.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

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

import com.teamlms.backend.domain.curricular.api.dto.CurricularEditResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularListItem;
import com.teamlms.backend.domain.curricular.entity.Curricular;
import com.teamlms.backend.domain.curricular.repository.CurricularRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class CurricularQueryServiceTest {

    @InjectMocks
    private CurricularQueryService curricularQueryService;

    @Mock
    private CurricularRepository curricularRepository;

    @Test
    @DisplayName("교과목 수정용 상세 조회 성공")
    void getForUpdate_Success() {
        // given
        Long curricularId = 1L;
        Curricular curricular = mock(Curricular.class);
        when(curricular.getCurricularId()).thenReturn(curricularId);
        when(curricular.getCurricularCode()).thenReturn("CS101");
        when(curricular.getCurricularName()).thenReturn("Introduction to Computer Science");
        when(curricular.getCredits()).thenReturn(3);
        when(curricular.getIsActive()).thenReturn(true);

        when(curricularRepository.findById(curricularId)).thenReturn(Optional.of(curricular));

        // when
        CurricularEditResponse response = curricularQueryService.getForUpdate(curricularId);

        // then
        assertNotNull(response);
        assertEquals(curricularId, response.curricularId());
        assertEquals("CS101", response.curricularCode());
        assertEquals("Introduction to Computer Science", response.curricularName());
        assertEquals(3, response.credits());
        assertTrue(response.isActive());
    }

    @Test
    @DisplayName("교과목 수정용 상세 조회 실패 - 존재하지 않는 교과목")
    void getForUpdate_Fail_NotFound() {
        // given
        Long curricularId = 999L;
        when(curricularRepository.findById(curricularId)).thenReturn(Optional.empty());

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> curricularQueryService.getForUpdate(curricularId));

        assertEquals(ErrorCode.CURRICULAR_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("교과목 목록조회 페이징 성공")
    void list_Success() {
        // given
        Long deptId = 1L;
        String keyword = "test";
        Pageable pageable = PageRequest.of(0, 10);

        CurricularListItem item = mock(CurricularListItem.class);
        Page<CurricularListItem> mockPage = new PageImpl<>(List.of(item), pageable, 1);

        when(curricularRepository.findList(eq(deptId), eq(keyword), eq(pageable))).thenReturn(mockPage);

        // when
        Page<CurricularListItem> result = curricularQueryService.list(deptId, keyword, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        verify(curricularRepository).findList(eq(deptId), eq(keyword), eq(pageable));
    }
}
