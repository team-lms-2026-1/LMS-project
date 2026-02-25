package com.teamlms.backend.domain.curricular.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.teamlms.backend.domain.curricular.api.dto.CurricularPatchRequest;
import com.teamlms.backend.domain.curricular.entity.Curricular;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularRepository;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class CurricularCommandServiceTest {

    @InjectMocks
    private CurricularCommandService curricularCommandService;

    @Mock
    private CurricularRepository curricularRepository;

    @Mock
    private CurricularOfferingRepository curricularOfferingRepository;

    @Mock
    private DeptRepository deptRepository;

    @Test
    @DisplayName("교과목 생성 성공")
    void create_Success() {
        // given
        String curricularCode = "CS101";
        String curricularName = "Introduction to Computer Science";
        Long deptId = 1L;
        Integer credits = 3;
        String description = "Basic CS course";

        when(deptRepository.existsById(deptId)).thenReturn(true);
        when(curricularRepository.existsByCurricularCode(curricularCode)).thenReturn(false);

        // when
        curricularCommandService.create(curricularCode, curricularName, deptId, credits, description);

        // then
        verify(curricularRepository).save(argThat(curricular -> curricular.getCurricularCode().equals(curricularCode) &&
                curricular.getCurricularName().equals(curricularName) &&
                curricular.getDeptId().equals(deptId) &&
                curricular.getCredits().equals(credits) &&
                curricular.getDescription().equals(description) &&
                curricular.getIsActive().equals(true)));
    }

    @Test
    @DisplayName("교과목 생성 실패 - 존재하지 않는 학과")
    void create_Fail_DeptNotFound() {
        // given
        Long deptId = 999L;
        when(deptRepository.existsById(deptId)).thenReturn(false);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> curricularCommandService.create("CS101", "Name", deptId, 3, "Desc"));

        assertEquals(ErrorCode.DEPT_NOT_FOUND, exception.getErrorCode());
        verify(curricularRepository, never()).save(any());
    }

    @Test
    @DisplayName("교과목 생성 실패 - 교과목 코드 중복")
    void create_Fail_CurricularCodeExists() {
        // given
        Long deptId = 1L;
        String curricularCode = "CS101";
        when(deptRepository.existsById(deptId)).thenReturn(true);
        when(curricularRepository.existsByCurricularCode(curricularCode)).thenReturn(true);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> curricularCommandService.create(curricularCode, "Name", deptId, 3, "Desc"));

        assertEquals(ErrorCode.CURRICULAR_CODE_ALREADY_EXISTS, exception.getErrorCode());
        verify(curricularRepository, never()).save(any());
    }

    @Test
    @DisplayName("교과목 수정 성공")
    void patch_Success() {
        // given
        Long curricularId = 1L;
        Curricular curricular = Curricular.builder()
                .curricularCode("CS101")
                .curricularName("Old Name")
                .deptId(1L)
                .credits(3)
                .description("Old Desc")
                .isActive(true)
                .build();

        CurricularPatchRequest request = new CurricularPatchRequest("New Name", 2L, 4, "New Desc", false);

        when(curricularRepository.findById(curricularId)).thenReturn(Optional.of(curricular));
        when(deptRepository.existsById(2L)).thenReturn(true);
        when(curricularOfferingRepository.existsByCurricularId(curricularId)).thenReturn(false);

        // when
        curricularCommandService.patch(curricularId, request);

        // then
        assertEquals("New Name", curricular.getCurricularName());
        assertEquals(2L, curricular.getDeptId());
        assertEquals(4, curricular.getCredits());
        assertEquals("New Desc", curricular.getDescription());
        assertEquals(false, curricular.getIsActive());
    }

    @Test
    @DisplayName("교과목 수정 실패 - 교과목 없음")
    void patch_Fail_CurricularNotFound() {
        // given
        Long curricularId = 999L;
        CurricularPatchRequest request = new CurricularPatchRequest("New Name", 2L, 4, "New Desc", false);

        when(curricularRepository.findById(curricularId)).thenReturn(Optional.empty());

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> curricularCommandService.patch(curricularId, request));

        assertEquals(ErrorCode.CURRICULAR_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("교과목 수정 실패 - 음수 학점")
    void patch_Fail_NegativeCredits() {
        // given
        Long curricularId = 1L;
        Curricular curricular = Curricular.builder()
                .deptId(1L)
                .credits(3)
                .build();

        CurricularPatchRequest request = new CurricularPatchRequest(null, null, -1, null, null);

        when(curricularRepository.findById(curricularId)).thenReturn(Optional.of(curricular));
        when(deptRepository.existsById(1L)).thenReturn(true); // deptId = 1 (default from entity)

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> curricularCommandService.patch(curricularId, request));

        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
    }

    @Test
    @DisplayName("교과목 수정 실패 - 이미 배정된 개설 교과가 있을 때 비활성화 불가")
    void patch_Fail_DeactivateNotAllowed() {
        // given
        Long curricularId = 1L;
        Curricular curricular = Curricular.builder()
                .deptId(1L)
                .credits(3)
                .isActive(true)
                .build();

        CurricularPatchRequest request = new CurricularPatchRequest(null, null, null, null, false);

        when(curricularRepository.findById(curricularId)).thenReturn(Optional.of(curricular));
        when(deptRepository.existsById(1L)).thenReturn(true);
        when(curricularOfferingRepository.existsByCurricularId(curricularId)).thenReturn(true);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> curricularCommandService.patch(curricularId, request));

        assertEquals(ErrorCode.CURRICULAR_DEACTIVATE_NOT_ALLOWED, exception.getErrorCode());
    }
}
