package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalCategoryResponse;
import com.teamlms.backend.domain.community.service.ResourceCategoryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
// import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping  //("/api/v1/admin/community/resources/categories")
@RequiredArgsConstructor
public class ResourceCategoryController {

    private final ResourceCategoryService categoryService;

    
    // =================================================================
    // 1. 자료실 카테고로 목록 조회 - 전부가능
    // =================================================================
    @GetMapping({"/api/v1/student/community/resources/categories",
                 "/api/v1/professor/community/resources/categories",
                 "/api/v1/admin/community/resources/categories"
    })
    @PreAuthorize("hasAuthority('RESOURCE_READ')")
    public ApiResponse<?> getList(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String keyword
    ) {
        Page<ExternalCategoryResponse> result = categoryService.getList(pageable, keyword);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    
    // =================================================================
    // 2. 자료실 카테고리 등록 - 어드민만 가능
    // =================================================================
    @PostMapping("/api/v1/admin/community/resources/categories")
    @PreAuthorize("hasAuthority('RESOURCE_MANAGE')")
    public ApiResponse<?> create(@Valid @RequestBody ExternalCategoryRequest request) {
        Long id = categoryService.create(request);
        return ApiResponse.ok(Map.of("categoryId", id));
    }

    // =================================================================
    // 3. 자료실 카테고로 수정 - 어드민만 가능
    // =================================================================
    @PatchMapping("/api/v1/admin/community/resources/categories/{categoryId}")
    @PreAuthorize("hasAuthority('RESOURCE_MANAGE')")
    public ApiResponse<?> update(
            @PathVariable Long categoryId,
            @Valid @RequestBody ExternalCategoryRequest request
    ) {
        categoryService.update(categoryId, request);
        return ApiResponse.ok(Map.of("success", true));
    }

    
    // =================================================================
    // 4. 자료실 카테고로 삭제 - 어드민만 가능
    // =================================================================
    @DeleteMapping("/api/v1/admin/community/resources/categories/{categoryId}")
    @PreAuthorize("hasAuthority('RESOURCE_MANAGE')")
    public ApiResponse<?> delete(@PathVariable Long categoryId) {
        categoryService.delete(categoryId);
        return ApiResponse.ok(Map.of("success", true));
    }
}