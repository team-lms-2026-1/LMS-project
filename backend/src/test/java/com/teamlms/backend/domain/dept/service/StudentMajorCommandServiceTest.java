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

import com.teamlms.backend.domain.dept.entity.StudentMajor;
import com.teamlms.backend.domain.dept.entity.StudentMajorId;
import com.teamlms.backend.domain.dept.enums.MajorType;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class StudentMajorCommandServiceTest {

    @InjectMocks
    private StudentMajorCommandService studentMajorCommandService;

    @Mock
    private MajorRepository majorRepository;

    @Mock
    private StudentMajorRepository studentMajorRepository;

    @Test
    @DisplayName("학생 전공 배정 - 성공")
    void assign_Success() {
        Long studentId = 1L;
        Long majorId = 100L;

        when(majorRepository.existsById(majorId)).thenReturn(true);
        when(studentMajorRepository.existsByIdStudentAccountIdAndIdMajorId(studentId, majorId)).thenReturn(false);
        when(studentMajorRepository.findByIdStudentAccountIdAndMajorType(studentId, MajorType.PRIMARY))
                .thenReturn(Optional.empty());

        studentMajorCommandService.assign(studentId, majorId, MajorType.PRIMARY);

        verify(studentMajorRepository, times(1)).save(any(StudentMajor.class));
    }

    @Test
    @DisplayName("학생 전공 배정 실패 - 전공 없음")
    void assign_Fail_MajorNotFound() {
        when(majorRepository.existsById(100L)).thenReturn(false);

        assertThrows(BusinessException.class, () -> studentMajorCommandService.assign(1L, 100L, MajorType.PRIMARY));
    }

    @Test
    @DisplayName("학생 전공 배정 실패 - 이미 동일한 전공 배정됨")
    void assign_Fail_AlreadyAssigned() {
        when(majorRepository.existsById(100L)).thenReturn(true);
        when(studentMajorRepository.existsByIdStudentAccountIdAndIdMajorId(1L, 100L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> studentMajorCommandService.assign(1L, 100L, MajorType.PRIMARY));
    }

    @Test
    @DisplayName("학생 전공 배정 실패 - 이미 주전공 존재함")
    void assign_Fail_PrimaryAlreadyExists() {
        Long studentId = 1L;
        Long majorId = 100L;

        when(majorRepository.existsById(majorId)).thenReturn(true);
        when(studentMajorRepository.existsByIdStudentAccountIdAndIdMajorId(studentId, majorId)).thenReturn(false);

        StudentMajor existingPrimary = StudentMajor.of(studentId, 200L, MajorType.PRIMARY);
        when(studentMajorRepository.findByIdStudentAccountIdAndMajorType(studentId, MajorType.PRIMARY))
                .thenReturn(Optional.of(existingPrimary));

        assertThrows(IllegalStateException.class,
                () -> studentMajorCommandService.assign(studentId, majorId, MajorType.PRIMARY));
    }

    @Test
    @DisplayName("전공 타입 변경 - 성공")
    void changeMajorType_Success() {
        Long studentId = 1L;
        Long majorId = 100L;
        StudentMajorId id = new StudentMajorId(studentId, majorId);

        StudentMajor sm = StudentMajor.of(studentId, majorId, MajorType.MINOR);
        when(studentMajorRepository.findById(id)).thenReturn(Optional.of(sm));

        when(studentMajorRepository.findByIdStudentAccountIdAndMajorType(studentId, MajorType.PRIMARY))
                .thenReturn(Optional.empty());

        studentMajorCommandService.changeMajorType(studentId, majorId, MajorType.PRIMARY);

        assertEquals(MajorType.PRIMARY, sm.getMajorType());
    }

    @Test
    @DisplayName("전공 연결 해제 - 성공")
    void unassign_Success() {
        Long studentId = 1L;
        Long majorId = 100L;
        StudentMajorId id = new StudentMajorId(studentId, majorId);

        when(studentMajorRepository.existsById(id)).thenReturn(true);

        studentMajorCommandService.unassign(studentId, majorId);

        verify(studentMajorRepository, times(1)).deleteById(id);
    }
}
