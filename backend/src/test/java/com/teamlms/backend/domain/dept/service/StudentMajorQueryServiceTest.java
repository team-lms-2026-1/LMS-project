package com.teamlms.backend.domain.dept.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.teamlms.backend.domain.dept.entity.StudentMajor;
import com.teamlms.backend.domain.dept.enums.MajorType;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;

@ExtendWith(MockitoExtension.class)
class StudentMajorQueryServiceTest {

    @InjectMocks
    private StudentMajorQueryService studentMajorQueryService;

    @Mock
    private StudentMajorRepository studentMajorRepository;

    @Test
    @DisplayName("특정 학생의 전공 매핑 리스트 반환 성공")
    void listByStudent_Success() {
        // given
        Long studentId = 1L;
        StudentMajor sm1 = StudentMajor.of(studentId, 100L, MajorType.PRIMARY);
        StudentMajor sm2 = StudentMajor.of(studentId, 200L, MajorType.MINOR);

        when(studentMajorRepository.findAllByIdStudentAccountId(studentId)).thenReturn(List.of(sm1, sm2));

        // when
        List<StudentMajor> result = studentMajorQueryService.listByStudent(studentId);

        // then
        assertEquals(2, result.size());
        assertEquals(MajorType.PRIMARY, result.get(0).getMajorType());
    }
}
