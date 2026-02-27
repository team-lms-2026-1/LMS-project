package com.teamlms.backend.domain.dept.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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

import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularRepository;
import com.teamlms.backend.domain.dept.api.dto.DepartmentDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.DeptListItem;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class DeptQueryServiceTest {

    @InjectMocks
    private DeptQueryService deptQueryService;

    @Mock
    private DeptRepository deptRepository;

    @Mock
    private ProfessorProfileRepository professorProfileRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private MajorRepository majorRepository;

    @Mock
    private CurricularRepository curricularRepository;

    @Test
    @DisplayName("학과 단건 조회(getOrThrow) - 성공")
    void getOrThrow_Success() {
        Dept dept = Dept.builder().deptName("소프트웨어학과").build();
        when(deptRepository.findById(1L)).thenReturn(Optional.of(dept));

        Dept result = deptQueryService.getOrThrow(1L);

        assertNotNull(result);
        assertEquals("소프트웨어학과", result.getDeptName());
    }

    @Test
    @DisplayName("학과 검색(search) - 키워드 없음")
    void search_NoKeyword() {
        Dept dept = Dept.builder().deptName("소프트웨어학과").build();
        Page<Dept> page = new PageImpl<>(List.of(dept));
        when(deptRepository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<Dept> result = deptQueryService.search(null, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(deptRepository, times(1)).findAll(any(PageRequest.class));
    }

    @Test
    @DisplayName("학과 리스트 조회(list)")
    void list_Success() {
        DeptListItem item = new DeptListItem(1L, "code", "name", "professor", 0L, 0L, true);
        Page<DeptListItem> page = new PageImpl<>(List.of(item));

        when(deptRepository.searchDeptList("keyword", PageRequest.of(0, 10))).thenReturn(page);

        Page<DeptListItem> result = deptQueryService.list("keyword", PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals("name", result.getContent().get(0).deptName());
    }

    @Test
    @DisplayName("학과 드롭다운 조회")
    void getDeptDropdown_Success() {
        // Dropdown을 위한 인터페이스(Projection)가 리턴된다면 인터페이스를 모킹하거나 관련 클래스 반환
        // 코드 구조상 List<DepartmentDropdownItem> 내부 from을 위해 Tuple 등 쿼리결과가 필요하지만,
        // 간단히 테스트하기 위해 빈 리스트 또는 간단한 모킹 처리를 진행.
        // -> DeptRepository.findActiveForDropdown는 List<Dept>나 Projection을 리턴할 수 있음.
        when(deptRepository.findActiveForDropdown()).thenReturn(List.of());

        List<DepartmentDropdownItem> result = deptQueryService.getDeptDropdown();

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    @DisplayName("학과 요약(getSummary) - 실패(존재하지 않음)")
    void getSummary_Fail_NotFound() {
        when(deptRepository.fetchDeptSummary(999L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> deptQueryService.getSummary(999L));
    }
}
