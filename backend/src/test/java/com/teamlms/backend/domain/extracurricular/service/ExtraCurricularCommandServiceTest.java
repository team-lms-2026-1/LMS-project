package com.teamlms.backend.domain.extracurricular.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularPatchRequest;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricular;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class ExtraCurricularCommandServiceTest {

        @InjectMocks
        private ExtraCurricularCommandService extraCurricularCommandService;

        @Mock
        private ExtraCurricularRepository extraCurricularRepository;

        @Test
        @DisplayName("비교과 생성 성공")
        void create_Success() {
                // given
                String code = "EXTRA01";
                String name = "봉사활동";
                String desc = "지역사회 봉사";
                String host = "학생처";

                when(extraCurricularRepository.existsByExtraCurricularCode(code)).thenReturn(false);

                // when
                extraCurricularCommandService.create(code, name, desc, host);

                // then
                verify(extraCurricularRepository).save(argThat(extra -> extra.getExtraCurricularCode().equals(code) &&
                                extra.getExtraCurricularName().equals(name) &&
                                extra.getDescription().equals(desc) &&
                                extra.getHostOrgName().equals(host) &&
                                extra.getIsActive().equals(true)));
        }

        @Test
        @DisplayName("비교과 생성 실패 - 코드 중복")
        void create_Fail_CodeExists() {
                // given
                String code = "EXTRA01";
                when(extraCurricularRepository.existsByExtraCurricularCode(code)).thenReturn(true);

                // when & then
                BusinessException exception = assertThrows(BusinessException.class,
                                () -> extraCurricularCommandService.create(code, "Name", "Desc", "Host"));

                assertEquals(ErrorCode.EXTRA_CURRICULAR_CODE_ALREADY_EXISTS, exception.getErrorCode());
                verify(extraCurricularRepository, never()).save(any());
        }

        @Test
        @DisplayName("비교과 수정 성공")
        void patch_Success() {
                // given
                Long id = 1L;
                ExtraCurricular extraCurricular = ExtraCurricular.builder()
                                .extraCurricularCode("EXTRA01")
                                .extraCurricularName("Old Name")
                                .description("Old Desc")
                                .hostOrgName("Old Host")
                                .isActive(true)
                                .build();

                ExtraCurricularPatchRequest request = new ExtraCurricularPatchRequest("New Name", "New Desc",
                                "New Host",
                                false);

                when(extraCurricularRepository.findById(id)).thenReturn(Optional.of(extraCurricular));

                // when
                extraCurricularCommandService.patch(id, request);

                // then
                assertEquals("New Name", extraCurricular.getExtraCurricularName());
                assertEquals("New Desc", extraCurricular.getDescription());
                assertEquals("New Host", extraCurricular.getHostOrgName());
                assertEquals(false, extraCurricular.getIsActive());
        }

        @Test
        @DisplayName("비교과 수정 실패 - 비교과 없음")
        void patch_Fail_NotFound() {
                // given
                Long id = 999L;
                ExtraCurricularPatchRequest request = new ExtraCurricularPatchRequest("New Name", "New Desc",
                                "New Host",
                                false);

                when(extraCurricularRepository.findById(id)).thenReturn(Optional.empty());

                // when & then
                BusinessException exception = assertThrows(BusinessException.class,
                                () -> extraCurricularCommandService.patch(id, request));

                assertEquals(ErrorCode.EXTRA_CURRICULAR_NOT_FOUND, exception.getErrorCode());
        }
}
