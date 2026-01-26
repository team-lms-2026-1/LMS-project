package com.teamlms.backend.domain.extracurricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularCreateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularPatchForm;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularPatchRequest;
import com.teamlms.backend.domain.extracurricular.service.ExtraCurricularCommandService;
import com.teamlms.backend.domain.extracurricular.service.ExtraCurricularQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/extra-curriculars")
public class AdminExtraCurricularController {

    private final ExtraCurricularCommandService extraCurricularCommandService;
    private final ExtraCurricularQueryService extraCurricularQueryService;

    @PostMapping
    public ApiResponse<SuccessResponse> create(
        @Valid @RequestBody ExtraCurricularCreateRequest req
    ) {
        extraCurricularCommandService.create(
            req.getExtraCurricularCode(),
            req.getExtraCurricularName(),
            req.getDescription(),
            req.getHostOrgName()
        );

        return ApiResponse.ok(new SuccessResponse());
    }

    @GetMapping("/{extraCurricularId}/edit")
    public ApiResponse<ExtraCurricularPatchForm> getEditForm(
        @PathVariable Long extraCurricularId
    ) {
        return ApiResponse.ok(extraCurricularQueryService.editForm(extraCurricularId));
    }

    @PatchMapping("/{extraCurricularId}")
    public ApiResponse<SuccessResponse> patch(
        @PathVariable Long extraCurricularId,
        @Valid @RequestBody ExtraCurricularPatchRequest req
    ) {
        extraCurricularCommandService.patch(extraCurricularId, req);
        return ApiResponse.ok(new SuccessResponse());
    }

    @GetMapping
    public ApiResponse<List<ExtraCurricularListItem>> getList(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.ASC, "extraCurricularCode")
        );

        Page<ExtraCurricularListItem> result =
                extraCurricularQueryService.list(keyword, pageable);
        
        return ApiResponse.of(
                result.getContent(),
                PageMeta.from(result)
        );
    }
}
