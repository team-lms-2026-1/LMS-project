package com.teamlms.backend.domain.dept.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.dept.api.dto.MajorCreateRequest;
import com.teamlms.backend.domain.dept.api.dto.MajorUpdateRequest;
import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class MajorCommandServiceTest {

    @InjectMocks
    private MajorCommandService majorCommandService;

    @Mock
    private DeptRepository deptRepository;

    @Mock
    private MajorRepository majorRepository;

    @Mock
    private StudentMajorRepository studentMajorRepository;

    @Test
    @DisplayName("전공 생성 - 성공")
    void create_Success() {
        // given
        Long deptId = 100L;
        MajorCreateRequest request = new MajorCreateRequest("CS_MAJOR", "소프트웨어전공", "설명", true);

        when(deptRepository.existsById(deptId)).thenReturn(true);
        when(majorRepository.existsByMajorCode(request.getMajorCode())).thenReturn(false);
        when(majorRepository.existsByDeptIdAndMajorName(deptId, request.getMajorName())).thenReturn(false);

        // when
        majorCommandService.create(deptId, request);

        // then
        verify(majorRepository, times(1)).save(any(Major.class));
    }

    @Test
    @DisplayName("전공 생성 실패 - 이름 중복")
    void create_Fail_DuplicateName() {
        Long deptId = 100L;
        MajorCreateRequest request = new MajorCreateRequest("CS_MAJOR", "소프트웨어전공", "설명", true);

        when(deptRepository.existsById(deptId)).thenReturn(true);
        when(majorRepository.existsByMajorCode(request.getMajorCode())).thenReturn(false);
        when(majorRepository.existsByDeptIdAndMajorName(deptId, request.getMajorName())).thenReturn(true);

        assertThrows(BusinessException.class, () -> majorCommandService.create(deptId, request));
    }

    @Test
    @DisplayName("전공 수정 - 성공")
    void updateMajor_Success() {
        // given
        Long deptId = 100L;
        Long majorId = 200L;
        MajorUpdateRequest request = new MajorUpdateRequest("신규전공명", "설명", true);

        when(deptRepository.existsById(deptId)).thenReturn(true);

        Major major = Major.builder().deptId(deptId).majorName("구전공명").build();
        ReflectionTestUtils.setField(major, "majorId", majorId);

        when(majorRepository.findById(majorId)).thenReturn(Optional.of(major));
        when(majorRepository.existsByDeptIdAndMajorName(deptId, "신규전공명")).thenReturn(false);

        // when
        majorCommandService.updateMajor(deptId, majorId, request);

        // then
        assertEquals("신규전공명", major.getMajorName());
    }

    @Test
    @DisplayName("전공 삭제 - 성공")
    void deleteMajor_Success() {
        Long deptId = 100L;
        Long majorId = 200L;

        when(deptRepository.existsById(deptId)).thenReturn(true);

        Major major = Major.builder().deptId(deptId).build();
        ReflectionTestUtils.setField(major, "majorId", majorId);

        when(majorRepository.findById(majorId)).thenReturn(Optional.of(major));
        when(studentMajorRepository.existsByIdMajorId(majorId)).thenReturn(false);

        // when
        majorCommandService.deleteMajor(deptId, majorId);

        // then
        verify(majorRepository, times(1)).delete(major);
    }

    @Test
    @DisplayName("전공 삭제 실패 - 학생에 의해 사용중")
    void deleteMajor_Fail_InUse() {
        Long deptId = 100L;
        Long majorId = 200L;

        when(deptRepository.existsById(deptId)).thenReturn(true);

        Major major = Major.builder().deptId(deptId).build();
        ReflectionTestUtils.setField(major, "majorId", majorId);

        when(majorRepository.findById(majorId)).thenReturn(Optional.of(major));
        when(studentMajorRepository.existsByIdMajorId(majorId)).thenReturn(true);

        assertThrows(BusinessException.class, () -> majorCommandService.deleteMajor(deptId, majorId));
        verify(majorRepository, never()).delete(any(Major.class));
    }
}
