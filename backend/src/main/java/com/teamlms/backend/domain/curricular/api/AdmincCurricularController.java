package com.teamlms.backend.domain.curricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.curricular.api.dto.CurricularCreateRequest;
import com.teamlms.backend.domain.curricular.api.dto.CurricularEditResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularListItem;
import com.teamlms.backend.domain.curricular.api.dto.CurricularPatchRequest;
import com.teamlms.backend.domain.curricular.service.CurricularCommandService;
import com.teamlms.backend.domain.curricular.service.CurricularQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/curriculars")
public class AdmincCurricularController {

    private final CurricularCommandService curricularCommandService;
    private final CurricularQueryService curricularQueryService;

    // 생성
    @PostMapping
    @PreAuthorize("hasAuthority('CURRICULAR_MANAGE')")
    public ApiResponse<SuccessResponse> create(
            @Valid @RequestBody CurricularCreateRequest req) {
        curricularCommandService.create(
                req.curricularCode(),
                req.curricularName(),
                req.deptId(),
                req.credits(),
                req.description());

        return ApiResponse.ok(new SuccessResponse());
    }

    // 수정 조회
    @GetMapping("/{curricularId}/edit")
    @PreAuthorize("hasAuthority('CURRICULAR_READ')")
    public ApiResponse<CurricularEditResponse> getForUpdate(
            @PathVariable Long curricularId) {
        return ApiResponse.ok(curricularQueryService.getForUpdate(curricularId));
    }

    // 수정
    @PatchMapping("/{curricularId}/edit")
    @PreAuthorize("hasAuthority('CURRICULAR_MANAGE')")
    public ApiResponse<SuccessResponse> patch(
            @PathVariable Long curricularId,
            @Valid @RequestBody CurricularPatchRequest req) {
        curricularCommandService.patch(curricularId, req);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 목록
    @GetMapping
    @PreAuthorize("hasAuthority('CURRICULAR_READ')")
    public ApiResponse<List<CurricularListItem>> getList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) String keyword) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.ASC, "curricularCode"));

        Page<CurricularListItem> result = curricularQueryService.list(deptId, keyword, pageable);

        return ApiResponse.of(
                result.getContent(),
                PageMeta.from(result));
    }
}
