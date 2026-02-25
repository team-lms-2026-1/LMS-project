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

import com.teamlms.backend.domain.curricular.api.dto.EnrollListItem;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;

@ExtendWith(MockitoExtension.class)
class EnrollmentQueryServiceTest {

    @InjectMocks
    private EnrollmentQueryService enrollmentQueryService;

    @Mock
    private CurricularOfferingRepository curricularOfferingRepository;

    @Test
    @DisplayName("신청 목록(수강신청 내역) 페이징 조회 성공")
    void listEnrollments_Success() {
        // given
        Long accountId = 1L;
        Pageable pageable = PageRequest.of(0, 10);

        EnrollListItem item = mock(EnrollListItem.class);
        Page<EnrollListItem> mockPage = new PageImpl<>(List.of(item), pageable, 1);

        when(curricularOfferingRepository.findOfferingEnrollList(eq(accountId), eq(pageable)))
                .thenReturn(mockPage);

        // when
        Page<EnrollListItem> result = enrollmentQueryService.listEnrollments(accountId, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        verify(curricularOfferingRepository).findOfferingEnrollList(eq(accountId), eq(pageable));
    }

    @Test
    @DisplayName("수강 목록(현재 수강중인 내역) 페이징 조회 성공")
    void listCurrentEnrollments_Success() {
        // given
        Long accountId = 1L;
        Pageable pageable = PageRequest.of(0, 10);

        EnrollListItem item = mock(EnrollListItem.class);
        Page<EnrollListItem> mockPage = new PageImpl<>(List.of(item), pageable, 1);

        when(curricularOfferingRepository.findOfferingCurrentEnrollments(eq(accountId), eq(pageable)))
                .thenReturn(mockPage);

        // when
        Page<EnrollListItem> result = enrollmentQueryService.listCurrentEnrollments(accountId, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        verify(curricularOfferingRepository).findOfferingCurrentEnrollments(eq(accountId), eq(pageable));
    }
}
