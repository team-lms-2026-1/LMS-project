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

import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class DeptCommandServiceTest {

    @InjectMocks
    private DeptCommandService deptCommandService;

    @Mock
    private DeptRepository deptRepository;

    @Mock
    private MajorRepository majorRepository;

    @Mock
    private ProfessorProfileRepository professorProfileRepository;

    @Mock
    private StudentMajorRepository studentMajorRepository;

    @Test
    @DisplayName("학과 생성 테스트 - 성공")
    void create_Success() {
        // given
        String deptCode = "CS";
        String deptName = "컴퓨터공학과";
        String desc = "컴공 설명";
        Long actorId = 1L;

        when(deptRepository.existsByDeptCode(deptCode)).thenReturn(false);
        when(deptRepository.existsByDeptName(deptName)).thenReturn(false);

        Dept savedDept = Dept.builder().deptCode(deptCode).deptName(deptName).active(true).build();
        ReflectionTestUtils.setField(savedDept, "deptId", 100L);
        when(deptRepository.save(any(Dept.class))).thenReturn(savedDept);

        // when
        Long deptId = deptCommandService.create(deptCode, deptName, desc, actorId);

        // then
        assertEquals(100L, deptId);
        verify(deptRepository, times(1)).save(any(Dept.class));
    }

    @Test
    @DisplayName("학과 생성 실패 - 학과 코드 중복")
    void create_Fail_DuplicateCode() {
        when(deptRepository.existsByDeptCode("CS")).thenReturn(true);

        assertThrows(BusinessException.class, () -> deptCommandService.create("CS", "컴퓨터공학과", "설명", 1L));
    }

    @Test
    @DisplayName("학과 수정 테스트 - 성공")
    void update_Success() {
        // given
        Dept dept = Dept.builder().deptCode("CS").deptName("기존컴공").active(true).build();
        ReflectionTestUtils.setField(dept, "deptId", 100L);

        when(deptRepository.findById(100L)).thenReturn(Optional.of(dept));
        when(deptRepository.existsByDeptName("신규컴공")).thenReturn(false);
        when(professorProfileRepository.existsByAccountIdAndDeptId(200L, 100L)).thenReturn(true);

        // when
        deptCommandService.update(100L, "신규컴공", 200L, "신규 설명", 1L);

        // then
        assertEquals("신규컴공", dept.getDeptName());
        assertEquals(200L, dept.getHeadProfessorAccountId());
        assertEquals("신규 설명", dept.getDescription());
    }

    @Test
    @DisplayName("학과 활성/비활성화 처리 - 정상 작동")
    void updateActive_Success() {
        Dept dept = Dept.builder().active(true).build();
        ReflectionTestUtils.setField(dept, "deptId", 100L);
        when(deptRepository.findById(100L)).thenReturn(Optional.of(dept));

        // Disable conditions (비활성 전환 시 연관데이터 체크)
        when(majorRepository.existsByDeptIdAndActiveTrue(100L)).thenReturn(false);
        when(professorProfileRepository.existsActiveProfessorByDeptId(100L)).thenReturn(false);
        when(studentMajorRepository.existsEnrolledPrimaryStudentByDeptId(100L)).thenReturn(false);

        // when (비활성화)
        deptCommandService.updateActive(100L, false, 1L);

        // then
        assertFalse(dept.isActive());

        // when (다시 활성화)
        deptCommandService.updateActive(100L, true, 1L);

        // then
        assertTrue(dept.isActive());
    }

    @Test
    @DisplayName("학과 비활성 실패 - 연관 데이터 존재")
    void updateActive_Fail_HasRelatedData() {
        Dept dept = Dept.builder().active(true).build();
        ReflectionTestUtils.setField(dept, "deptId", 100L);
        when(deptRepository.findById(100L)).thenReturn(Optional.of(dept));

        // 연관 데이터 존재 (전공)
        when(majorRepository.existsByDeptIdAndActiveTrue(100L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> deptCommandService.updateActive(100L, false, 1L));
    }

    @Test
    @DisplayName("학과장 변경 성공")
    void updateHeadProfessor_Success() {
        Dept dept = Dept.builder().deptCode("CS").build();
        ReflectionTestUtils.setField(dept, "deptId", 100L);

        when(deptRepository.findById(100L)).thenReturn(Optional.of(dept));
        when(professorProfileRepository.existsByAccountIdAndDeptId(300L, 100L)).thenReturn(true);

        deptCommandService.updateHeadProfessor(100L, 300L);

        assertEquals(300L, dept.getHeadProfessorAccountId());
    }
}
