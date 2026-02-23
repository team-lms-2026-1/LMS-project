package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.service.NoticeCategoryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NoticeCategoryController {

    private final NoticeCategoryService categoryService;

    @PostMapping("/api/v1/admin/community/notices/categories")
    @PreAuthorize("hasAuthority('NOTICE_MANAGE')")
    public ApiResponse<Map<String, Object>> createCategory(
            @RequestBody ExternalCategoryRequest request) {
        Long categoryId = categoryService.createCategory(request);

        return ApiResponse.ok(Map.of("success", true, "categoryId", categoryId));
    }

    // 1. 공지사항 카테고리 목록 조회
    @GetMapping({ "/api/v1/student/community/notices/categories",
            "/api/v1/admin/community/notices/categories",
            "/api/v1/professor/community/notices/categories" })
    @PreAuthorize("hasAuthority('NOTICE_READ') or hasAnyRole('STUDENT','PROFESSOR','ADMIN')")
    public ApiResponse<List<Map<String, Object>>> getNoticeCategories(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return getNoticeCategoryListInternal(page, size, keyword);
    }

    private ApiResponse<List<Map<String, Object>>> getNoticeCategoryListInternal(int page, int size, String keyword) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Map<String, Object>> pageResult = categoryService.getCategoryList(pageable, keyword);

        return ApiResponse.of(
                pageResult.getContent(),
                PageMeta.from(pageResult));
    }

    // 1-2. 카테고리 수정 (관리자)
    @PatchMapping("/api/v1/admin/community/notices/categories/{categoryId}")
    @PreAuthorize("hasAuthority('NOTICE_MANAGE')")
    public ApiResponse<Map<String, Boolean>> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody ExternalCategoryRequest request) {
        categoryService.updateCategory(categoryId, request);
        return ApiResponse.ok(Map.of("success", true));
    }

    // 1-3. 카테고리 삭제 (관리자)
    @DeleteMapping("/api/v1/admin/community/notices/categories/{categoryId}")
    @PreAuthorize("hasAuthority('NOTICE_MANAGE')")
    public ApiResponse<Map<String, Boolean>> deleteCategory(
            @PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId);
        return ApiResponse.ok(Map.of("success", true));
    }
}