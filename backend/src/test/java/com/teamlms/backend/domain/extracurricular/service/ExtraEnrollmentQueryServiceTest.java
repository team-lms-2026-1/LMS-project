package com.teamlms.backend.domain.extracurricular.service;

import static org.junit.jupiter.api.Assertions.*;
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

import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraEnrollmentListItem;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;

@ExtendWith(MockitoExtension.class)
class ExtraEnrollmentQueryServiceTest {

    @InjectMocks
    private ExtraEnrollmentQueryService extraEnrollmentQueryService;

    @Mock
    private ExtraCurricularApplicationRepository applicationRepository;

    @Test
    @DisplayName("학생 수강 신청 내역 조회 성공")
    void listEnrollments_Success() {
        // given
        Long studentId = 1L;
        Pageable pageable = PageRequest.of(0, 10);
        StudentExtraEnrollmentListItem item = mock(StudentExtraEnrollmentListItem.class);
        Page<StudentExtraEnrollmentListItem> pageResult = new PageImpl<>(List.of(item));

        when(applicationRepository.findStudentEnrollments(studentId, pageable)).thenReturn(pageResult);

        // when
        Page<StudentExtraEnrollmentListItem> result = extraEnrollmentQueryService.listEnrollments(studentId, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    @DisplayName("학생 현재 진행 중인 수강 신청 내역 조회 성공")
    void listCurrentEnrollments_Success() {
        // given
        Long studentId = 1L;
        Pageable pageable = PageRequest.of(0, 10);
        StudentExtraEnrollmentListItem item = mock(StudentExtraEnrollmentListItem.class);
        Page<StudentExtraEnrollmentListItem> pageResult = new PageImpl<>(List.of(item));

        when(applicationRepository.findStudentCurrentEnrollments(studentId, pageable)).thenReturn(pageResult);

        // when
        Page<StudentExtraEnrollmentListItem> result = extraEnrollmentQueryService.listCurrentEnrollments(studentId,
                pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
}
