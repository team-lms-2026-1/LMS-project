package com.teamlms.backend.domain.dept.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.dept.api.dto.DepartmentDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.DeptCurricularDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.DeptMajorDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.DeptProfessorDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.ProfessorDropdownItem;
import com.teamlms.backend.domain.dept.service.DeptQueryService;
import com.teamlms.backend.domain.dept.service.MajorQueryService;
import com.teamlms.backend.global.api.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/depts")
public class DeptController {
    
    private final DeptQueryService deptQueryService;
    private final MajorQueryService majorQueryService;
    // 학과 목록 드롭다운
    @GetMapping("/dropdown")
    public ApiResponse<List<DepartmentDropdownItem>> dropdown() {
        return ApiResponse.ok(deptQueryService.getDeptDropdown());
    }
    
    // 학과의 전공 목록 드롭다운
    @GetMapping("/{deptId}/majors/dropdown")
    public ApiResponse<List<DeptMajorDropdownItem>> deptMajorDropdown(
        @PathVariable Long deptId
    ) {
        return ApiResponse.ok(majorQueryService.getDeptMajorDropdown(deptId));
    }
    // 학과의 전공 목록 드롭다운
    @GetMapping("/{deptId}/curriculars/dropdown")
    public ApiResponse<List<DeptCurricularDropdownItem>> deptCurricularDropdown(
        @PathVariable Long deptId
    ) {
        return ApiResponse.ok(deptQueryService.getDeptCurricularDropdown(deptId));
    }

    // 학과의 교수 목록 드롭다운
    @GetMapping("/{deptId}/professors/dropdown")
    public ApiResponse<List<ProfessorDropdownItem>> deptProfessorDropdown(
        @PathVariable Long deptId
    ) {
        return ApiResponse.ok(deptQueryService.getDeptProfessorDropdown(deptId));
    }
}
