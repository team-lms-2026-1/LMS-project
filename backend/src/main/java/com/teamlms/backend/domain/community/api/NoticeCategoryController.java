package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalCategoryResponse;
import com.teamlms.backend.domain.community.service.NoticeCategoryService;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//관리자 부분 페이지 네이션 앞에 (/api/v1/admin/) 넣기

@RestController
// 요청하신 URL 구조 반영: /notices/categories (앞에 /api/community 등은 프로젝트 규칙에 따름)
@RequestMapping("/api/community/notices/categories") 
@RequiredArgsConstructor
public class NoticeCategoryController {

    private final NoticeCategoryService categoryService;

    // =================================================================
    // 1-1. 카테고리 목록 조회 (페이징 + 검색)
    // URL: GET /api/community/notices/categories?page=1&size=20&keyword=...
    // =================================================================
    @GetMapping
    public ResponseEntity<Page<ExternalCategoryResponse>> getCategoryList(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String keyword
    ) {
        Page<ExternalCategoryResponse> list = categoryService.getCategoryList(pageable, keyword);
        return ResponseEntity.ok(list);
    }

    // =================================================================
    // 1-2. 카테고리 수정 (관리자)
    // URL: PATCH /api/community/notices/categories/{categoryId}
    // =================================================================
    @PatchMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')") //  ADMIN 권한 체크
    public ResponseEntity<Void> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody ExternalCategoryRequest request
    ) {
        categoryService.updateCategory(categoryId, request);
        return ResponseEntity.ok().build();
    }

    // =================================================================
    // 1-3. 카테고리 삭제 (관리자)
    // URL: DELETE /api/community/notices/categories/{categoryId}
    // =================================================================
    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')") //  ADMIN 권한 체크
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long categoryId
    ) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok().build();
    }
    
    // (참고) 등록 API도 필요하다면 여기에 추가
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> createCategory(@Valid @RequestBody ExternalCategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }
}