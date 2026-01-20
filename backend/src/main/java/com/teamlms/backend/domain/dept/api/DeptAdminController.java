package com.teamlms.backend.domain.dept.api;


import com.teamlms.backend.domain.dept.api.dto.DepartmentDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.DeptActiveUpdateRequest;
import com.teamlms.backend.domain.dept.api.dto.DeptCreateRequest;
import com.teamlms.backend.domain.dept.api.dto.DeptEditResponse;
import com.teamlms.backend.domain.dept.api.dto.DeptListItem;
import com.teamlms.backend.domain.dept.api.dto.DeptMajorDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.DeptMajorListItem;
import com.teamlms.backend.domain.dept.api.dto.DeptProfessorListItem;
import com.teamlms.backend.domain.dept.api.dto.DeptStudentListItem;
import com.teamlms.backend.domain.dept.api.dto.DeptSummaryResponse;
import com.teamlms.backend.domain.dept.api.dto.DeptUpdateFormResponse;
import com.teamlms.backend.domain.dept.api.dto.DeptUpdateRequest;
import com.teamlms.backend.domain.dept.api.dto.MajorCreateRequest;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.service.DeptCommandService;
import com.teamlms.backend.domain.dept.service.DeptQueryService;
import com.teamlms.backend.domain.dept.service.MajorCommandService;
import com.teamlms.backend.domain.dept.service.MajorQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/depts")
public class DeptAdminController {

    private final DeptCommandService deptCommandService;
    private final DeptQueryService deptQueryService;
    private final MajorQueryService majorQueryService;
    private final MajorCommandService majorCommandService;

    // 학과 등록
    @PostMapping
    public ApiResponse<SuccessResponse> create(@Valid @RequestBody DeptCreateRequest req) {

        // actorAccountId는 Auditing(@CreatedBy)로 들어가게 해놨으면 굳이 여기서 안 넘겨도 됨.
        // 일단 기존 시그니처가 있으니 null로 전달해도 됨(서비스에서 안 쓰고 있음).
        deptCommandService.create(
                req.getDeptCode(),
                req.getDeptName(),
                req.getDescription(),
                null
        );

        return ApiResponse.ok(new SuccessResponse());
    }

    // 수정 페이지 진입 시 조회
    @GetMapping("/{deptId}/edit")
    public ApiResponse<DeptEditResponse> getForUpdate(
            @PathVariable Long deptId
    ) {
        Dept dept = deptQueryService.getOrThrow(deptId);

        return ApiResponse.ok(
            new DeptEditResponse(
                DeptUpdateFormResponse.from(dept),
                deptQueryService.getDeptProfessorDropdown(deptId)
            )
        );
    }


    // 수정
    @PatchMapping("/{deptId}/edit")
    public ApiResponse<SuccessResponse> update(
            @PathVariable Long deptId,
            @Valid @RequestBody DeptUpdateRequest req
    ) {
        deptCommandService.update(
                deptId,
                req.deptName(),
                req.headProfessorAccountId(),
                req.description(),
                null
        );
        return ApiResponse.ok(new SuccessResponse());
    }


    // 학과 목록
    @GetMapping
    public ApiResponse<List<DeptListItem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword
    ){
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.ASC, "deptCode")
        );

        Page<DeptListItem> result =
                deptQueryService.list(keyword, pageable);

        return ApiResponse.of(
                result.getContent(),
                PageMeta.from(result)
        );
    }
    // 학과 목록 - 활성화/비활성화
    @PatchMapping("/{deptId}/active")
    public ApiResponse<SuccessResponse> updateActive(
        @PathVariable Long deptId,
        @RequestBody DeptActiveUpdateRequest req
    ) {
        deptCommandService.updateActive(deptId, req.isActive(), null);
        return ApiResponse.ok(new SuccessResponse());
    }

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

    // 학과 상세 (summary)
    @GetMapping("/{deptId}/summary")
    public ApiResponse<DeptSummaryResponse> summary(@PathVariable Long deptId) {
        return ApiResponse.ok(deptQueryService.getSummary(deptId));
    }
    
    // 학과 상세 (교수)
    @GetMapping("/{deptId}/professors")
    public ApiResponse<List<DeptProfessorListItem>> listDeptProfessors(
        @PathVariable Long deptId,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<DeptProfessorListItem> result = 
                deptQueryService.getDeptProfessors(deptId, keyword, pageable);
        
        return ApiResponse.of(result.getContent(), PageMeta.from(result));

    }

    // 학과 상세 (학생)
    @GetMapping("/{deptId}/students")
    public ApiResponse<List<DeptStudentListItem>> listDeptStudents(
        @PathVariable Long deptId,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<DeptStudentListItem> result = 
                deptQueryService.getDeptStudents(deptId, keyword, pageable);
        
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 전공 
    @GetMapping("/{deptId}/majors")
    public ApiResponse<List<DeptMajorListItem>> listDeptMajors(
        @PathVariable Long deptId,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<DeptMajorListItem> result = 
                deptQueryService.getDeptMajors(deptId, keyword, pageable);
        
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 전공 등록
    @PostMapping("/{deptId}/majors")
    public ApiResponse<SuccessResponse> createMajor(
        @PathVariable Long deptId,
        @Valid @RequestBody MajorCreateRequest request
    ) {
        majorCommandService.create(deptId, request);

        return ApiResponse.ok(new SuccessResponse());
    }
    
}
