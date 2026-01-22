package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalCategoryResponse;
import com.teamlms.backend.domain.community.service.QnaCategoryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping // ("/api/v1/community/qna/categories")
@RequiredArgsConstructor
public class QnaCategoryController {

    private final QnaCategoryService service;
    // =================================================================
    // 1. Q&A 카테고리 목록 조회 - 전부가능
    // =================================================================
    @GetMapping({"/api/v1/student/community/qna/categories",
                 "/api/v1/professor/community/qna/categories",
                 "/api/v1/admin/community/qna/categories"
    })
    @PreAuthorize("hasAuthority('QNA_READ')")
    public ApiResponse<?> getList(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String keyword) {
        Page<ExternalCategoryResponse> result = service.getList(pageable, keyword);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
    
    // =================================================================
    // 2. Q&A 카테고리 등록 - 어드민만 가능
    // =================================================================
    @PostMapping("/api/v1/admin/community/qna/categories")
    @PreAuthorize("hasAuthority('QNA_MANAGE')")
    public ApiResponse<?> create(@Valid @RequestBody ExternalCategoryRequest request) {
        Long id = service.create(request);
        return ApiResponse.ok(Map.of("categoryId", id));
    }

    // =================================================================
    // 3. Q&A 카테고리 수정 - 어드민만 가능
    // =================================================================
    @PatchMapping("/api/v1/admin/community/qna/categories/{categoryId}")
    @PreAuthorize("hasAuthority('QNA_MANAGE')")
    public ApiResponse<?> update(@PathVariable Long categoryId, @Valid @RequestBody ExternalCategoryRequest request) {
        service.update(categoryId, request);
        return ApiResponse.ok(Map.of("success", true));
    }

    // =================================================================
    // 4. Q&A 카테고리 삭제 - 어드민만 가능
    // =================================================================
    @DeleteMapping("/api/v1/admin/community/qna/categories/{categoryId}")
    @PreAuthorize("hasAuthority('QNA_MANAGE')")
    public ApiResponse<?> delete(@PathVariable Long categoryId) {
        service.delete(categoryId);
        return ApiResponse.ok(Map.of("success", true));
    }
}