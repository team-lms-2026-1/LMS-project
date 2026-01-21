package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalCategoryResponse;
import com.teamlms.backend.domain.community.service.FaqCategoryService;
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
@RequestMapping("/api/v1/community/faq/categories") // 정책서 경로: /faq/categories
@RequiredArgsConstructor
public class FaqCategoryController {

    private final FaqCategoryService service;
    // =================================================================
    // 1. FAQ 카테고리 목록 조회 - 전부가능
    // =================================================================
    @GetMapping
    public ApiResponse<?> getList(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String keyword) {
        Page<ExternalCategoryResponse> result = service.getList(pageable, keyword);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // =================================================================
    // 2. FAQ 카테고리 등록 - 어드민만 가능
    // =================================================================
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> create(@Valid @RequestBody ExternalCategoryRequest request) {
        Long id = service.create(request);
        return ApiResponse.ok(Map.of("categoryId", id));
    }
    //수정
    // =================================================================
    // 3. FAQ 카테고리 수정 - 어드민만 가능
    // =================================================================
    
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> update(@PathVariable Long id, @Valid @RequestBody ExternalCategoryRequest request) {
        service.update(id, request);
        return ApiResponse.ok(Map.of("success", true));
    }
    //삭제
    // =================================================================
    // 4. FAQ 카테고리 수정 - 어드민만 가능
    // =================================================================
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok(Map.of("success", true));
    }
}