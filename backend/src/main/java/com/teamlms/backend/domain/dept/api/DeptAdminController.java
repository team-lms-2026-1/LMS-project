package com.teamlms.backend.domain.dept.api;


import com.teamlms.backend.domain.dept.api.dto.DepartmentDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.DeptActiveUpdateRequest;
import com.teamlms.backend.domain.dept.api.dto.DeptCreateRequest;
import com.teamlms.backend.domain.dept.api.dto.DeptListItem;
import com.teamlms.backend.domain.dept.api.dto.MajorDropdownItem;
import com.teamlms.backend.domain.dept.service.DeptCommandService;
import com.teamlms.backend.domain.dept.service.DeptQueryService;
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


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/depts")
public class DeptAdminController {

    private final DeptCommandService deptCommandService;
    private final DeptQueryService deptQueryService;
    private final MajorQueryService majorQueryService;


    /**
     * 학과 등록 (관리자)
     * POST /api/v1/admin/depts
     */
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
    
    // 전공 목록 드롭다운
    @GetMapping("/{deptId}/majors/dropdown")
    public ApiResponse<List<MajorDropdownItem>> majordropdown(
        @PathVariable Long deptId
    ) {
        return ApiResponse.ok(majorQueryService.getMajorDropdown(deptId));
    }
}
