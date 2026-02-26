package com.teamlms.backend.domain.dept.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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

import com.teamlms.backend.domain.dept.api.dto.DeptMajorDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.MajorDropdownItem;
import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;

@ExtendWith(MockitoExtension.class)
class MajorQueryServiceTest {

    @InjectMocks
    private MajorQueryService majorQueryService;

    @Mock
    private MajorRepository majorRepository;

    @Mock
    private DeptRepository deptRepository;

    @Test
    @DisplayName("전공 단건 조회(getOrThrow) - 성공")
    void getOrThrow_Success() {
        Major major = Major.builder().majorName("컴퓨터공학").build();
        when(majorRepository.findById(1L)).thenReturn(Optional.of(major));

        Major result = majorQueryService.getOrThrow(1L);

        assertNotNull(result);
        assertEquals("컴퓨터공학", result.getMajorName());
    }

    @Test
    @DisplayName("특정 학과의 전공 리스트 조회")
    void listByDept_Success() {
        Major major1 = Major.builder().majorName("전공1").build();
        Major major2 = Major.builder().majorName("전공2").build();

        when(majorRepository.findAllByDeptIdOrderBySortOrderAscMajorIdAsc(100L))
                .thenReturn(List.of(major1, major2));

        List<Major> result = majorQueryService.listByDept(100L);

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("특정 학과의 전공 페이징 조회")
    void pageByDept_Success() {
        Major major = Major.builder().majorName("전공1").build();
        Page<Major> page = new PageImpl<>(List.of(major));

        when(majorRepository.findAllByDeptId(eq(100L), any(PageRequest.class))).thenReturn(page);

        Page<Major> result = majorQueryService.pageByDept(100L, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    @DisplayName("학과의 전공 드롭다운 리스트 조회")
    void getDeptMajorDropdown_Success() {
        // 단건 조회 테스트
        Major deptAuth = Major.builder().build();
        when(majorRepository.findById(100L)).thenReturn(Optional.of(deptAuth));

        // 해당 학과의 전공 드롭다운을 반환
        when(majorRepository.findActiveForDropdownByDeptId(100L)).thenReturn(List.of());

        List<DeptMajorDropdownItem> result = majorQueryService.getDeptMajorDropdown(100L);

        assertNotNull(result);
    }

    @Test
    @DisplayName("전체 활성 전공 드롭다운 리스트 조회")
    void getMajorDropdown_Success() {
        when(majorRepository.findActiveForDropdown()).thenReturn(List.of());

        List<MajorDropdownItem> result = majorQueryService.getMajorDropdown();

        assertNotNull(result);
    }
}
