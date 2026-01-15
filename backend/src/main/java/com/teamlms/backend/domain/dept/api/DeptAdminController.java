package com.teamlms.backend.domain.dept.api;

import com.teamlms.backend.domain.dept.api.dto.DeptCreateRequest;
import com.teamlms.backend.domain.dept.service.DeptCommandService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.dto.SuccessResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/depts")
public class DeptAdminController {

    private final DeptCommandService deptCommandService;

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
}
